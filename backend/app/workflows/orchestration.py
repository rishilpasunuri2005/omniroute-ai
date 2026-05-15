import time
import uuid
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.prompts import CODING_SYSTEM_PROMPT, GENERAL_SYSTEM_PROMPT, PLANNER_SYSTEM_PROMPT
from app.agents.validation import ValidationAgent
from app.core.config import Settings
from app.models.conversation import ConversationTurn
from app.models.saas import RoutingLog
from app.router.engine import RoutingEngine
from app.schemas.chat import ChatRequest, ChatResponse, Usage, WorkflowStep
from app.schemas.routing import RouteResponse, ValidationResult
from app.security.auth import AuthContext
from app.services.ai_provider import AIProviderService, ProviderCompletion
from app.services.budget import enforce_token_budget, record_token_usage
from app.services.metrics import record_model_metric
from app.services.token_counter import estimate_local_cost, estimate_tokens
from app.services.users import get_or_create_user
from app.utils.sanitize import sanitize_prompt


class WorkflowState(TypedDict, total=False):
    request: ChatRequest
    conversation_id: str
    route: RouteResponse
    trace: list[WorkflowStep]
    plan: str
    response: str
    validation: ValidationResult
    model_used: str
    provider: str
    usage: dict[str, int]


class AgentWorkflow:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.router = RoutingEngine(settings)
        self.ai = AIProviderService(settings)
        self.validator = ValidationAgent()
        self.graph = self._build_graph()

    async def run(self, request: ChatRequest, session: AsyncSession, auth: AuthContext) -> ChatResponse:
        start = time.perf_counter()
        conversation_id = request.conversation_id or str(uuid.uuid4())
        sanitized_request = request.model_copy(
            update={"prompt": sanitize_prompt(request.prompt, self.settings.max_prompt_chars)}
        )

        user = await get_or_create_user(session, auth, self.settings)
        await enforce_token_budget(session, user, estimate_tokens(sanitized_request.prompt))
        state = await self.graph.ainvoke({"request": sanitized_request, "conversation_id": conversation_id})

        route = state["route"]
        trace = state["trace"]
        response = state["response"]
        validation = state["validation"]
        model_used = state["model_used"]
        provider = state["provider"]
        provider_usage = state.get("usage", {"prompt_tokens": 0, "completion_tokens": 0})

        latency_ms = int((time.perf_counter() - start) * 1000)
        prompt_tokens = provider_usage["prompt_tokens"] or estimate_tokens(sanitized_request.prompt)
        completion_tokens = provider_usage["completion_tokens"] or estimate_tokens(response)
        total_tokens = prompt_tokens + completion_tokens
        estimated_cost = estimate_local_cost(total_tokens)

        record = ConversationTurn(
            conversation_id=conversation_id,
            prompt=sanitized_request.prompt,
            response=response,
            task_type=route.classification.task_type,
            complexity=route.classification.complexity,
            model_used=model_used,
            confidence=route.classification.confidence,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            latency_ms=latency_ms,
            estimated_cost=estimated_cost,
            validation=validation.model_dump(),
            workflow_trace=[step.model_dump() for step in trace],
        )
        session.add(record)
        session.add(
            RoutingLog(
                user_id=user.id,
                task_type=route.classification.task_type,
                complexity=route.classification.complexity,
                selected_model=model_used,
                provider=provider,
                confidence=route.classification.confidence,
                latency_ms=latency_ms,
                success=validation.passed,
            )
        )
        await record_token_usage(session, user, prompt_tokens, completion_tokens, estimated_cost)
        await record_model_metric(session, provider, model_used, total_tokens, latency_ms, validation.passed)
        await session.commit()

        return ChatResponse(
            conversation_id=conversation_id,
            response=response,
            model_used=model_used,
            latency_ms=latency_ms,
            usage=Usage(prompt_tokens=prompt_tokens, completion_tokens=completion_tokens, total_tokens=total_tokens),
            classification=route.classification,
            validation=validation,
            workflow_trace=trace,
            estimated_cost=estimated_cost,
        )

    def _build_graph(self):
        graph = StateGraph(WorkflowState)
        graph.add_node("router", self._route_node)
        graph.add_node("planner", self._planner_node)
        graph.add_node("execute", self._execute_node)
        graph.add_node("validate", self._validate_node)
        graph.set_entry_point("router")
        graph.add_conditional_edges("router", self._should_plan, {"planner": "planner", "execute": "execute"})
        graph.add_edge("planner", "execute")
        graph.add_edge("execute", "validate")
        graph.add_edge("validate", END)
        return graph.compile()

    async def _route_node(self, state: WorkflowState) -> dict[str, Any]:
        request = state["request"]
        route = self.router.route(request.prompt)
        return {
            "route": route,
            "trace": [
                WorkflowStep(
                    agent="Router Agent",
                    status="completed",
                    detail=f"Selected {route.provider}/{route.selected_model}: {route.reason}",
                ),
            ],
        }

    async def _planner_node(self, state: WorkflowState) -> dict[str, Any]:
        request = state["request"]
        route = state["route"]
        completion = await self.ai.generate(route.provider, route.selected_model, request.prompt, PLANNER_SYSTEM_PROMPT)
        return {
            "plan": completion.text,
            "usage": self._add_usage(state.get("usage"), completion),
            "trace": state["trace"] + [
                WorkflowStep(agent="Planner Agent", status="completed", detail="Generated execution plan"),
            ],
        }

    async def _execute_node(self, state: WorkflowState) -> dict[str, Any]:
        request = state["request"]
        route = state["route"]
        system_prompt = CODING_SYSTEM_PROMPT if route.classification.task_type in {"coding", "debugging"} else GENERAL_SYSTEM_PROMPT
        composed_prompt = self._compose_prompt(request, state.get("plan", ""))
        completion = await self.ai.generate(route.provider, route.selected_model, composed_prompt, system_prompt)
        return {
            "response": completion.text,
            "model_used": route.selected_model,
            "provider": route.provider,
            "usage": self._add_usage(state.get("usage"), completion),
            "trace": state["trace"] + [
                WorkflowStep(agent=self._agent_name(route.classification.task_type), status="completed", detail="Generated response"),
            ],
        }

    async def _validate_node(self, state: WorkflowState) -> dict[str, Any]:
        request = state["request"]
        route = state["route"]
        response = state["response"]
        validation = self.validator.validate(response, expected_json=self._expects_json(request.prompt))
        if not validation.passed:
            retry_prompt = f"Repair this response. Issues: {', '.join(validation.issues)}\n\nOriginal prompt:\n{request.prompt}\n\nResponse:\n{response}"
            completion = await self.ai.generate(route.fallback_provider, route.fallback_model, retry_prompt, GENERAL_SYSTEM_PROMPT)
            validation = self.validator.validate(completion.text, expected_json=self._expects_json(request.prompt))
            return {
                "response": completion.text,
                "validation": validation,
                "model_used": route.fallback_model,
                "provider": route.fallback_provider,
                "usage": self._add_usage(state.get("usage"), completion),
                "trace": state["trace"] + [
                    WorkflowStep(agent="Validation Agent", status="repaired", detail="Fallback model attempted response repair"),
                ],
            }
        return {
            "validation": validation,
            "model_used": state["model_used"],
            "provider": state["provider"],
            "trace": state["trace"] + [
                WorkflowStep(agent="Validation Agent", status="completed", detail="Response passed validation checks"),
            ],
        }

    @staticmethod
    def _should_plan(state: WorkflowState) -> str:
        return "planner" if state["route"].classification.complexity in {"medium", "complex"} else "execute"

    @staticmethod
    def _add_usage(current: dict[str, int] | None, completion: ProviderCompletion) -> dict[str, int]:
        usage = current or {"prompt_tokens": 0, "completion_tokens": 0}
        return {
            "prompt_tokens": usage["prompt_tokens"] + completion.prompt_tokens,
            "completion_tokens": usage["completion_tokens"] + completion.completion_tokens,
        }

    @staticmethod
    def _agent_name(task_type: str) -> str:
        if task_type in {"coding", "debugging"}:
            return "Coding Agent"
        if task_type == "planning":
            return "Planner Agent"
        if task_type == "summarization":
            return "Summarization Agent"
        return "Specialized Agent"

    @staticmethod
    def _expects_json(prompt: str) -> bool:
        return "json" in prompt.lower() or "schema" in prompt.lower()

    @staticmethod
    def _compose_prompt(request: ChatRequest, plan: str) -> str:
        history = "\n".join(f"{item.role}: {item.content}" for item in request.history[-8:])
        sections = []
        if history:
            sections.append(f"Conversation history:\n{history}")
        if plan:
            sections.append(f"Planner output:\n{plan}")
        sections.append(f"User prompt:\n{request.prompt}")
        return "\n\n".join(sections)
