import json
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.service import get_analytics
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.models.saas import Workflow
from app.router.engine import RoutingEngine
from app.schemas.analytics import AnalyticsResponse, ModelInfo
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.routing import RouteRequest, RouteResponse
from app.schemas.workflow import WorkflowCreateRequest, WorkflowCreateResponse
from app.security.auth import AuthContext, get_current_user, require_role
from app.security.rate_limit import limiter
from app.services.users import get_or_create_user
from app.workflows.orchestration import AgentWorkflow

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health(settings: Settings = Depends(get_settings)) -> dict:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


@limiter.limit("60/minute")
@router.post("/route", response_model=RouteResponse)
async def route_prompt(
    request: Request,
    payload: RouteRequest,
    user: Annotated[AuthContext, Depends(get_current_user)],
    settings: Settings = Depends(get_settings),
) -> RouteResponse:
    return RoutingEngine(settings).route(payload.prompt)


@limiter.limit("10/minute")
@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: Request,
    payload: ChatRequest,
    user: Annotated[AuthContext, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
):
    workflow = AgentWorkflow(settings)
    if payload.stream:
        return StreamingResponse(
            _stream_chat(workflow, payload, session, user, settings),
            media_type="application/x-ndjson",
        )
    return await workflow.run(payload, session, user)


@limiter.limit("60/minute")
@router.get("/analytics", response_model=AnalyticsResponse)
async def analytics(
    request: Request,
    user: Annotated[AuthContext, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
) -> AnalyticsResponse:
    return await get_analytics(session)


@limiter.limit("60/minute")
@router.get("/models", response_model=list[ModelInfo])
async def models(
    request: Request,
    user: Annotated[AuthContext, Depends(get_current_user)],
    settings: Settings = Depends(get_settings),
) -> list[ModelInfo]:
    configured = [
        ModelInfo(name=settings.simple_model, role="simple", provider="groq", available=bool(settings.groq_api_key), context_window=8192),
        ModelInfo(name=settings.balanced_model, role="balanced", provider="groq", available=bool(settings.groq_api_key), context_window=8192),
        ModelInfo(name=settings.coding_model, role="coding", provider="openrouter", available=bool(settings.openrouter_api_key), context_window=16384),
        ModelInfo(name=settings.reasoning_model, role="reasoning", provider="openrouter", available=bool(settings.openrouter_api_key), context_window=32768),
        ModelInfo(name=settings.fallback_model, role="fallback", provider="openrouter", available=bool(settings.openrouter_api_key), context_window=8192),
    ]
    seen: set[str] = set()
    return [model for model in configured if not (model.name in seen or seen.add(model.name))]


@limiter.limit("10/minute")
@router.post("/workflow/create", response_model=WorkflowCreateResponse)
async def create_workflow(
    request: Request,
    payload: WorkflowCreateRequest,
    user: Annotated[AuthContext, Depends(require_role("user", "developer", "admin"))],
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> WorkflowCreateResponse:
    db_user = await get_or_create_user(session, user, settings)
    workflow = Workflow(
        user_id=db_user.id,
        name=payload.name,
        description=payload.description,
        graph=payload.graph,
    )
    session.add(workflow)
    await session.commit()
    await session.refresh(workflow)
    return WorkflowCreateResponse(
        id=str(workflow.id),
        name=workflow.name,
        description=workflow.description,
        is_active=workflow.is_active,
    )


_MAX_STREAM_WAIT_SECONDS = 120


async def _stream_chat(
    workflow: AgentWorkflow,
    payload: ChatRequest,
    session: AsyncSession,
    user: AuthContext,
    settings: Settings,
):
    import asyncio
    import time

    yield json.dumps({"type": "status", "message": "Routing request..."}) + "\n"

    task = asyncio.create_task(workflow.run(payload, session, user))
    start = time.monotonic()

    try:
        while not task.done():
            elapsed = time.monotonic() - start
            if elapsed > _MAX_STREAM_WAIT_SECONDS:
                task.cancel()
                logger.error("stream_chat_timeout prompt=%s elapsed=%.1fs", payload.prompt[:80], elapsed)
                yield json.dumps({"type": "error", "message": "Request timed out. Please try again with a simpler prompt."}) + "\n"
                return

            _, _ = await asyncio.wait([task], timeout=3.0)
            if task.done():
                break
            yield json.dumps({"type": "status", "message": "Processing..."}) + "\n"

        # task is done — check for exceptions
        exc = task.exception() if not task.cancelled() else None
        if exc is not None:
            logger.exception("stream_chat_task_error", exc_info=exc)
            detail = str(exc)
            # Provide useful error messages without leaking internals
            if hasattr(exc, "status_code") and exc.status_code == 503:
                detail = "AI provider is not configured. Please check your API keys."
            elif hasattr(exc, "status_code") and exc.status_code == 502:
                lower_detail = detail.lower()
                if "quota" in lower_detail or "insufficient" in lower_detail or "budget" in lower_detail:
                    detail = "AI provider quota exceeded. Please check your provider account or billing."
                else:
                    detail = "AI provider request failed. Please check your API keys and try again."
            elif hasattr(exc, "status_code") and exc.status_code == 429:
                detail = "AI provider rate limit exceeded. Please try again later."
            elif hasattr(exc, "status_code") and exc.status_code == 402:
                detail = "AI provider quota exceeded. Please check your provider account or billing."
            elif "not configured" in detail.lower():
                detail = "AI provider is not configured. Please set your API keys in the .env file."
            elif "database" in detail.lower() or "postgres" in detail.lower() or "sqlalchemy" in detail.lower():
                detail = "Database connection error. Please try again later."
            elif "daily token budget" in detail.lower() or "user token budget" in detail.lower():
                detail = "Daily token budget exceeded."
            elif "budget" in detail.lower() and "exceeded" in detail.lower():
                detail = "AI provider quota exceeded. Please check your provider account or billing."
            else:
                # Log the full detail for debugging but show a safe message
                logger.error("unhandled_chat_error detail=%s", detail)
                detail = f"Something went wrong: {detail}"
            yield json.dumps({"type": "error", "message": detail}) + "\n"
            return

        result = task.result()
    except asyncio.CancelledError:
        task.cancel()
        yield json.dumps({"type": "error", "message": "Request was cancelled."}) + "\n"
        return
    except Exception as exc:
        logger.exception("stream_chat_unexpected_error")
        yield json.dumps({"type": "error", "message": f"Unexpected error: {exc}"}) + "\n"
        return

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
