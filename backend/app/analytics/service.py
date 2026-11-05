from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import ConversationTurn
from app.schemas.analytics import AnalyticsResponse
from app.services.token_counter import estimate_cost_savings


async def get_analytics(
    session: AsyncSession,
    user_id: str | None = None,
    recent_user_id: str | None = None,
) -> AnalyticsResponse:
    filters = [ConversationTurn.user_id == user_id] if user_id else []

    total_requests = await session.scalar(select(func.count()).select_from(ConversationTurn).where(*filters)) or 0
    total_tokens = await session.scalar(select(func.coalesce(func.sum(ConversationTurn.total_tokens), 0)).where(*filters)) or 0
    avg_latency = await session.scalar(select(func.coalesce(func.avg(ConversationTurn.latency_ms), 0)).where(*filters)) or 0
    estimated_cost = await session.scalar(select(func.coalesce(func.sum(ConversationTurn.estimated_cost), 0)).where(*filters)) or 0

    routing_distribution = await _count_by(session, ConversationTurn.complexity, filters)
    model_utilization = await _count_by(session, ConversationTurn.model_used, filters)
    task_type_distribution = await _count_by(session, ConversationTurn.task_type, filters)

    recent_query = select(ConversationTurn).order_by(ConversationTurn.created_at.desc()).limit(8)
    activity_filter = recent_user_id or user_id
    if activity_filter:
        recent_query = recent_query.where(ConversationTurn.user_id == activity_filter)
    else:
        # When no user context is available, do not leak raw cross-tenant prompt data
        recent_query = recent_query.where(ConversationTurn.id == None)  # noqa: E711

    recent_rows = (await session.execute(recent_query)).scalars()
    recent_activity = [
        {
            "id": str(row.id),
            "prompt": row.prompt[:120],
            "model_used": row.model_used,
            "complexity": row.complexity,
            "task_type": row.task_type,
            "latency_ms": row.latency_ms,
            "created_at": row.created_at.isoformat(),
        }
        for row in recent_rows
    ]

    return AnalyticsResponse(
        total_requests=total_requests,
        total_tokens=total_tokens,
        average_latency_ms=round(float(avg_latency), 2),
        estimated_cost=round(float(estimated_cost), 6),
        estimated_cost_savings=estimate_cost_savings(total_tokens),
        routing_distribution=routing_distribution,
        model_utilization=model_utilization,
        task_type_distribution=task_type_distribution,
        recent_activity=recent_activity,
    )


async def _count_by(session: AsyncSession, column, filters: list | None = None) -> dict[str, int]:
    query = select(column, func.count())
    if filters:
        query = query.where(*filters)
    rows = await session.execute(query.group_by(column))
    return {str(key): int(count) for key, count in rows.all()}

