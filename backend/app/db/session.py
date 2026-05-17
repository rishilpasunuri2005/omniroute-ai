from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

_db_url = settings.sqlalchemy_database_url

# If the database URL still points at localhost (no real DB configured),
# fall back to a local SQLite file so the app can still function.
if "localhost" in _db_url or "127.0.0.1" in _db_url:
    _db_url = "sqlite+aiosqlite:///./omniroute_fallback.db"

_is_sqlite = _db_url.startswith("sqlite")

engine = create_async_engine(
    _db_url,
    pool_pre_ping=True,
    **({} if _is_sqlite else {"pool_timeout": 10, "pool_size": 5}),
    **({"connect_args": {"check_same_thread": False}} if _is_sqlite else {}),
)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
