import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.main import app
from app.models.base import Base
from app.security.auth import AuthContext, get_current_user


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    maker = async_sessionmaker(engine, expire_on_commit=False)

    async def _session():
        async with maker() as s:
            yield s

    app.dependency_overrides[get_session] = _session
    app.dependency_overrides[get_current_user] = lambda: AuthContext(user_id="clerk_test", role="user", email="t@example.com")
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None)  # no NIM key configured
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_list_starts_empty(client):
    response = await client.get("/knowledge")
    assert response.status_code == 200 and response.json() == []


@pytest.mark.asyncio
@pytest.mark.parametrize("name", ["notes.txt", "notes.pdf", "../x.md", "a/b.md"])
async def test_upload_rejects_non_md_files(client, name):
    response = await client.post("/knowledge", json={"filename": name, "content": "# hi"})
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_upload_without_embedding_key_is_503_and_stores_nothing(client):
    response = await client.post("/knowledge", json={"filename": "notes.md", "content": "# Notes\n\nhello there"})
    assert response.status_code == 503
    assert (await client.get("/knowledge")).json() == []


@pytest.mark.asyncio
async def test_delete_unknown_document_is_404(client):
    response = await client.delete("/knowledge/11111111-1111-1111-1111-111111111111")
    assert response.status_code == 404
