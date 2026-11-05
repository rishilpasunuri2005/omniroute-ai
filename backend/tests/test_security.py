import pytest
from datetime import date
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException

from app.core.config import Settings
from app.models.saas import TokenUsage, User
from app.security.auth import AuthContext, require_role
from app.security.rate_limit import rate_limit_key
from app.services.budget import enforce_token_budget


def test_auth_required_default_is_true():
    settings = Settings()
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
async def test_token_budget_enforcement_raises_402():
    mock_session = AsyncMock()
    user = User(id="user-1", clerk_user_id="c-1", daily_token_budget=1000)

    # Mock usage: 900 tokens used today + 200 requested = 1100 > 1000 budget
    mock_usage = TokenUsage(user_id="user-1", usage_date=date.today(), total_tokens=900)
    mock_session.scalar.return_value = mock_usage

    with pytest.raises(HTTPException) as exc_info:
        await enforce_token_budget(mock_session, user, estimated_prompt_tokens=200)

    assert exc_info.value.status_code == 402
    assert "Daily token budget exceeded" in exc_info.value.detail
