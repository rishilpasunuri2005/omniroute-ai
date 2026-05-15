from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saas import TokenUsage, User


async def enforce_token_budget(session: AsyncSession, user: User, estimated_prompt_tokens: int) -> None:
    usage = await session.scalar(
        select(TokenUsage).where(TokenUsage.user_id == user.id, TokenUsage.usage_date == date.today())
    )
    used = usage.total_tokens if usage else 0
    if used + estimated_prompt_tokens > user.daily_token_budget:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Daily token budget exceeded",
        )


async def record_token_usage(
    session: AsyncSession,
    user: User,
    prompt_tokens: int,
    completion_tokens: int,
    estimated_cost: float,
) -> None:
    usage = await session.scalar(
        select(TokenUsage).where(TokenUsage.user_id == user.id, TokenUsage.usage_date == date.today())
    )
    if not usage:
        usage = TokenUsage(user_id=user.id, usage_date=date.today())
        session.add(usage)
    usage.prompt_tokens += prompt_tokens
    usage.completion_tokens += completion_tokens
    usage.total_tokens += prompt_tokens + completion_tokens
    usage.estimated_cost += estimated_cost

