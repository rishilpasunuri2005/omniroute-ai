import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saas import ModelMetric

logger = logging.getLogger(__name__)


async def record_model_metric(
    session: AsyncSession,
    provider: str,
    model_name: str,
    total_tokens: int,
    latency_ms: int,
    success: bool,
) -> None:
    try:
        metric = await session.scalar(
            select(ModelMetric).where(ModelMetric.provider == provider, ModelMetric.model_name == model_name)
        )
        if not metric:
            metric = ModelMetric(provider=provider, model_name=model_name)
            session.add(metric)

        previous_requests = metric.total_requests or 0
        metric.total_requests = previous_requests + 1
        metric.successful_requests = (metric.successful_requests or 0) + (1 if success else 0)
        metric.failed_requests = (metric.failed_requests or 0) + (0 if success else 1)
        metric.total_tokens = (metric.total_tokens or 0) + total_tokens
        metric.average_latency_ms = (
            (((metric.average_latency_ms or 0) * previous_requests) + latency_ms) / metric.total_requests
            if metric.total_requests
            else latency_ms
        )
    except Exception:
        logger.exception("record_model_metric_error")
