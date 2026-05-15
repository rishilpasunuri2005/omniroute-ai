from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.saas import User
from app.security.auth import AuthContext


async def get_or_create_user(session: AsyncSession, auth: AuthContext, settings: Settings) -> User:
    existing = await session.scalar(select(User).where(User.clerk_user_id == auth.user_id))
    if existing:
        if existing.email != auth.email or existing.role != auth.role:
            existing.email = auth.email
            existing.role = auth.role
            await session.flush()
        return existing

    user = User(
        clerk_user_id=auth.user_id,
        email=auth.email,
        role=auth.role,
        daily_token_budget=settings.per_user_daily_token_budget,
    )
    session.add(user)
    await session.flush()
    return user

