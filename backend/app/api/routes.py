import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.service import get_analytics
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.router.engine import RoutingEngine
from app.schemas.analytics import AnalyticsResponse, ModelInfo
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.routing import RouteRequest, RouteResponse
from app.services.ollama import OllamaService
from app.workflows.orchestration import AgentWorkflow

router = APIRouter()


@router.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


@router.post("/route", response_model=RouteResponse)
async def route_prompt(payload: RouteRequest, settings: Settings = Depends(get_settings)) -> RouteResponse:
    return RoutingEngine(settings).route(payload.prompt)


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
):
    workflow = AgentWorkflow(settings)
    if payload.stream:
        return StreamingResponse(
            _stream_chat(workflow, payload, session),
            media_type="application/x-ndjson",
        )
    return await workflow.run(payload, session)


@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(session: AsyncSession = Depends(get_session)) -> AnalyticsResponse:
    return await get_analytics(session)


@router.get("/models", response_model=list[ModelInfo])
async def models(settings: Settings = Depends(get_settings)) -> list[ModelInfo]:
    service = OllamaService(settings)
    installed = set(await service.list_models())
    configured = [
        ModelInfo(name=settings.simple_model, role="simple", available=settings.simple_model in installed, context_window=8192),
        ModelInfo(name=settings.balanced_model, role="balanced", available=settings.balanced_model in installed, context_window=8192),
        ModelInfo(name=settings.coding_model, role="coding", available=settings.coding_model in installed, context_window=16384),
        ModelInfo(name=settings.reasoning_model, role="reasoning", available=settings.reasoning_model in installed, context_window=32768),
        ModelInfo(name=settings.fallback_model, role="fallback", available=settings.fallback_model in installed, context_window=4096),
    ]
    seen: set[str] = set()
    return [model for model in configured if not (model.name in seen or seen.add(model.name))]


async def _stream_chat(workflow: AgentWorkflow, payload: ChatRequest, session: AsyncSession):
    yield json.dumps({"type": "status", "message": "Routing request"}) + "\n"
    result = await workflow.run(payload, session)
    yield json.dumps(
        {
            "type": "metadata",
            "model_used": result.model_used,
            "classification": result.classification.model_dump(),
            "latency_ms": result.latency_ms,
            "usage": result.usage.model_dump(),
        }
    ) + "\n"
    for index in range(0, len(result.response), 42):
        yield json.dumps({"type": "token", "content": result.response[index:index + 42]}) + "\n"
    yield json.dumps({"type": "done", "result": result.model_dump(mode="json")}) + "\n"

