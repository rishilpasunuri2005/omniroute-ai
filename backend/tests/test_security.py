import asyncio

import pytest
from datetime import date
from unittest.mock import MagicMock
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import Settings
from app.models.base import Base
from app.models.saas import TokenUsage, User
from app.security.auth import AuthContext, require_role
from app.security.rate_limit import rate_limit_key
from app.services.budget import enforce_token_budget, record_token_usage


def test_auth_required_default_is_true():
    # Isolate from backend/.env so this tests the field default, not local dev config.
    settings = Settings(_env_file=None)
    assert settings.auth_required is True


@pytest.mark.asyncio
async def test_require_role_exact_match_prevents_substring_bypass():
    dep = require_role("developer")

    # Roles containing substring 'admin' or 'developer' should be rejected if not exact match
    restricted_roles = ["not_an_admin", "admin_viewer", "developer_intern", "guest"]
    for role in restricted_roles:
        user = AuthContext(user_id="test", role=role)
        with pytest.raises(HTTPException) as exc_info:
            await dep(user)
        assert exc_info.value.status_code == 403

    # Exact 'developer' matches allowed roles
    dev_user = AuthContext(user_id="test", role="developer")
    result = await dep(dev_user)
    assert result == dev_user

    # Exact 'admin' has superuser bypass
    admin_user = AuthContext(user_id="test", role="admin")
    result = await dep(admin_user)
    assert result == admin_user


def test_rate_limit_key_ignores_unauthenticated_bearer_header():
    # Unauthenticated request with arbitrary Bearer token
    request = MagicMock()
    request.state = MagicMock(spec=[])
    request.headers = {"authorization": "Bearer random-token-123"}
    request.client.host = "192.168.1.100"

    key = rate_limit_key(request)
    assert not key.startswith("bearer:")
    assert key == "192.168.1.100"

    # Authenticated request uses user identity
    request.state.auth_user = AuthContext(user_id="user_abc123")
    key_auth = rate_limit_key(request)
    assert key_auth == "user:user_abc123"


@pytest.mark.asyncio
async def test_token_budget_enforcement_raises_402(tmp_path):
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'budget_402.db'}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with Session() as session:
        user = User(clerk_user_id="c-1", email="c1@x.com", role="user", daily_token_budget=1000)
        session.add(user)
        await session.commit()

        # 900 tokens already used today + 200 requested = 1100 > 1000 budget.
        session.add(TokenUsage(user_id=user.id, usage_date=date.today(), total_tokens=900))
        await session.commit()

        with pytest.raises(HTTPException) as exc_info:
            await enforce_token_budget(session, user, estimated_prompt_tokens=200)

        assert exc_info.value.status_code == 402
        assert "Daily token budget exceeded" in exc_info.value.detail

    await engine.dispose()


@pytest.mark.asyncio
async def test_token_budget_enforcement_is_race_free_under_concurrent_requests(tmp_path):
    """Regression test: concurrent requests from the same user must not be
    able to jointly exceed the daily budget by all reading the same stale
    'used so far' value and all passing the check."""
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'budget_race.db'}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    async with Session() as session:
        user = User(clerk_user_id="race-user", email="race@x.com", role="user", daily_token_budget=100)
        session.add(user)
        await session.commit()
        user_id = user.id

    async def simulated_request():
        async with Session() as session:
            user = await session.get(User, user_id)
            try:
                await enforce_token_budget(session, user, estimated_prompt_tokens=40)
            except HTTPException:
                return "rejected"
            await asyncio.sleep(0.05)  # simulate a slow upstream LLM call
            await record_token_usage(
                session, user, prompt_tokens=40, completion_tokens=0, estimated_cost=0.0, reserved_tokens=40,
            )
            await session.commit()
            return "accepted"

    results = await asyncio.gather(*[simulated_request() for _ in range(5)])
    assert results.count("accepted") == 2  # floor(100 / 40)

    async with Session() as session:
        usage = await session.scalar(
            select(TokenUsage).where(TokenUsage.user_id == user_id, TokenUsage.usage_date == date.today())
        )
        assert usage.total_tokens <= 100

    await engine.dispose()

