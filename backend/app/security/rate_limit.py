import hashlib

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def rate_limit_key(request: Request) -> str:
    auth = request.headers.get("authorization")
    if auth and auth.lower().startswith("bearer "):
        return "bearer:" + hashlib.sha256(auth.encode("utf-8")).hexdigest()
    state_user = getattr(request.state, "auth_user", None)
    if state_user:
        return f"user:{state_user.user_id}"
    return get_remote_address(request)


limiter = Limiter(key_func=rate_limit_key, headers_enabled=True)

