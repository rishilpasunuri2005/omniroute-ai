import logging
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saas import TokenUsage, User

logger = logging.getLogger(__name__)


async def enforce_token_budget(session: AsyncSession, user: User, estimated_prompt_tokens: int) -> None:
    usage = await session.scalar(
        select(TokenUsage).where(TokenUsage.user_id == user.id, TokenUsage.usage_date == date.today())
    )
    used = usage.total_tokens if usage else 0
    if used + estimated_prompt_tokens > user.daily_token_budget:
        logger.warning(
            "token_budget_exceeded user_id=%s used=%d budget=%d requested=%d",
            user.id, used, user.daily_token_budget, estimated_prompt_tokens,
        )
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Daily token budget exceeded. Please try again tomorrow or upgrade your plan.",
        )


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
