import hashlib
import time
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from app.core.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthContext:
    user_id: str
    role: str = "user"
    email: str | None = None
    token_hash: str | None = None


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@lru_cache(maxsize=8)
def _jwks_client(jwks_url: str) -> PyJWKClient:
    return PyJWKClient(jwks_url, cache_keys=True, lifespan=300)


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AuthContext:
    if not settings.auth_required:
        user = AuthContext(user_id="dev-user", role="admin", email="dev@local.test")
        request.state.auth_user = user
        return user

    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not settings.clerk_jwks_url or not settings.clerk_issuer:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Authentication is not configured")

    token = credentials.credentials
    try:
        signing_key = _jwks_client(settings.clerk_jwks_url).get_signing_key_from_jwt(token)
        decode_options = {"verify_aud": bool(settings.clerk_audience)}
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer,
            audience=settings.clerk_audience,
            options=decode_options,
            leeway=30,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc

    if payload.get("exp") and int(payload["exp"]) < int(time.time()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication token expired")

    role = (
        payload.get("org_role")
        or payload.get("role")
        or payload.get("public_metadata", {}).get("role")
        or "user"
    )
    user = AuthContext(
        user_id=str(payload["sub"]),
        role=str(role),
        email=payload.get("email") or payload.get("primary_email_address"),
        token_hash=_token_hash(token),
    )
    request.state.auth_user = user
    return user


def require_role(*allowed_roles: str):
    async def dependency(user: Annotated[AuthContext, Depends(get_current_user)]) -> AuthContext:
        normalized = {role.lower() for role in allowed_roles}
        if user.role.lower() not in normalized and "admin" not in user.role.lower():
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user

    return dependency

