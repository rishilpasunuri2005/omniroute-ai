from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saas import ModelMetric


async def record_model_metric(
    session: AsyncSession,
    provider: str,
    model_name: str,
    total_tokens: int,
    latency_ms: int,
    success: bool,
) -> None:
    metric = await session.scalar(
        select(ModelMetric).where(ModelMetric.provider == provider, ModelMetric.model_name == model_name)
    )
    if not metric:
        metric = ModelMetric(provider=provider, model_name=model_name)
        session.add(metric)

    previous_requests = metric.total_requests
    metric.total_requests += 1
    metric.successful_requests += 1 if success else 0
    metric.failed_requests += 0 if success else 1
    metric.total_tokens += total_tokens
    metric.average_latency_ms = (
        ((metric.average_latency_ms * previous_requests) + latency_ms) / metric.total_requests
        if metric.total_requests
        else latency_ms
    )

