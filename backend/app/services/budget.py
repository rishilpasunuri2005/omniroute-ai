import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saas import TokenUsage, User

logger = logging.getLogger(__name__)


async def enforce_token_budget(session: AsyncSession, user: User, estimated_prompt_tokens: int) -> None:
    """Check token budget but only log warnings instead of blocking requests.

    In production with real auth, this could raise HTTP 402 to enforce hard limits.
    For dev/demo environments, we just log and let the request through.
    """
    try:
        usage = await session.scalar(
            select(TokenUsage).where(TokenUsage.user_id == user.id, TokenUsage.usage_date == date.today())
        )
        used = usage.total_tokens if usage else 0
        if used + estimated_prompt_tokens > user.daily_token_budget:
            logger.warning(
                "token_budget_warning user_id=%s used=%d budget=%d",
                user.id, used, user.daily_token_budget,
            )
    except Exception:
        logger.exception("enforce_token_budget_error")


async def record_token_usage(
    session: AsyncSession,
    user: User,
    prompt_tokens: int,
    completion_tokens: int,
    estimated_cost: float,
) -> None:
    try:
        usage = await session.scalar(
            select(TokenUsage).where(TokenUsage.user_id == user.id, TokenUsage.usage_date == date.today())
        )
        if not usage:
            usage = TokenUsage(user_id=user.id, usage_date=date.today())
            session.add(usage)
        usage.prompt_tokens = (usage.prompt_tokens or 0) + prompt_tokens
        usage.completion_tokens = (usage.completion_tokens or 0) + completion_tokens
        usage.total_tokens = (usage.total_tokens or 0) + prompt_tokens + completion_tokens
        usage.estimated_cost = (usage.estimated_cost or 0) + estimated_cost
    except Exception:
        logger.exception("record_token_usage_error")
