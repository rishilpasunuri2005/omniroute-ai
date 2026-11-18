import logging
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saas import TokenUsage, User

logger = logging.getLogger(__name__)


async def _ensure_usage_row(session: AsyncSession, user_id: str, today: date) -> None:
    exists = await session.scalar(
        select(TokenUsage.id).where(TokenUsage.user_id == user_id, TokenUsage.usage_date == today)
    )
    if exists is not None:
        return
    try:
        async with session.begin_nested():
            session.add(TokenUsage(user_id=user_id, usage_date=today))
            await session.flush()
    except IntegrityError:
        pass  # a concurrent request already created today's row; fine


async def enforce_token_budget(session: AsyncSession, user: User, estimated_prompt_tokens: int) -> None:
    """Reserve `estimated_prompt_tokens` against today's budget, atomically.

    This is a single conditional UPDATE rather than a read-then-compare, so
    two concurrent requests can't both read the same "used so far" value and
    both pass: the database itself serializes writers to the same row, so at
    most one of two simultaneous reservations that would jointly exceed the
    budget actually lands. record_token_usage() corrects the reservation to
    the real token count once actual usage is known. Committed immediately
    (rather than held open across the slow upstream LLM calls that follow)
    so the reservation window stays short.
    """
    today = date.today()
    await _ensure_usage_row(session, user.id, today)

    result = await session.execute(
        update(TokenUsage)
        .where(
            TokenUsage.user_id == user.id,
            TokenUsage.usage_date == today,
            TokenUsage.total_tokens + estimated_prompt_tokens <= user.daily_token_budget,
        )
        .values(total_tokens=TokenUsage.total_tokens + estimated_prompt_tokens)
    )
    await session.commit()

    if result.rowcount == 0:
        used = await session.scalar(
            select(TokenUsage.total_tokens).where(TokenUsage.user_id == user.id, TokenUsage.usage_date == today)
        ) or 0
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
    reserved_tokens: int = 0,
) -> None:
    """Record actual usage, correcting the reservation enforce_token_budget made.

    `reserved_tokens` is the estimate enforce_token_budget already added to
    total_tokens; only the delta between that estimate and the real total is
    applied here, so usage isn't double-counted.
    """
    today = date.today()
    delta_tokens = prompt_tokens + completion_tokens - reserved_tokens
    try:
        await _ensure_usage_row(session, user.id, today)
        await session.execute(
            update(TokenUsage)
            .where(TokenUsage.user_id == user.id, TokenUsage.usage_date == today)
            .values(
                prompt_tokens=TokenUsage.prompt_tokens + prompt_tokens,
                completion_tokens=TokenUsage.completion_tokens + completion_tokens,
                total_tokens=TokenUsage.total_tokens + delta_tokens,
                estimated_cost=TokenUsage.estimated_cost + estimated_cost,
            )
        )
    except Exception:
        logger.exception("record_token_usage_error")
