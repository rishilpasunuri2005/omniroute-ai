import hashlib
import math
import re

import pytest
import pytest_asyncio
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.config import Settings
from app.models.base import Base
from app.models.knowledge import KnowledgeChunk, KnowledgeDocument
from app.models.saas import User
from app.schemas.chat import ChatRequest
from app.schemas.knowledge import KnowledgeUpload
from app.services.rag import (
    EmbeddingError,
    LibraryLimitError,
    RetrievedChunk,
    chunk_markdown,
    delete_document,
    format_context,
    ingest_document,
    retrieve_context,
)
from app.workflows.orchestration import AgentWorkflow

DIM = 64


def _vec(text: str) -> list[float]:
    v = [0.0] * DIM
    for word in re.findall(r"[a-z]+", text.lower()):
        v[int(hashlib.md5(word.encode()).hexdigest(), 16) % DIM] += 1.0
    return v


class FakeEmbedder:
    def __init__(self):
        self.calls: list[tuple[int, str]] = []

    async def __call__(self, settings, texts, input_type):
        self.calls.append((len(texts), input_type))
        return [_vec(t) for t in texts]


def _settings(**overrides) -> Settings:
    base = dict(NVIDIA_NIM_API_KEY="test", rag_min_score=0.2, rag_top_k=3, _env_file=None)
    base.update(overrides)
    return Settings(**base)


@pytest_asyncio.fixture
async def session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    maker = async_sessionmaker(engine, expire_on_commit=False)
    async with maker() as s:
        s.add_all([User(id="11111111-1111-1111-1111-111111111111", clerk_user_id="u1"), User(id="22222222-2222-2222-2222-222222222222", clerk_user_id="u2")])
        await s.commit()
        yield s
    await engine.dispose()


U1 = "11111111-1111-1111-1111-111111111111"
U2 = "22222222-2222-2222-2222-222222222222"

CATS = "# Cats\n\nCats sleep most of the day and purr when happy. A cat grooms its fur with its tongue."
TAX = "# Tax\n\nIncome tax returns are due in April. File your tax forms and keep every receipt for deductions."


# ---- chunking -------------------------------------------------------------

def test_chunk_empty_returns_nothing():
    assert chunk_markdown("") == []
    assert chunk_markdown("  \n\n ") == []


def test_chunk_short_text_is_single_chunk():
    assert chunk_markdown("# T\n\nhello world") == ["# T\n\nhello world"]


def test_chunks_respect_max_and_carry_heading():
    paras = "\n\n".join(f"Paragraph {i} " + "word " * 40 for i in range(12))
    chunks = chunk_markdown("# Guide\n\n" + paras, max_chars=500)
    assert len(chunks) > 1
    assert all(len(c) <= 500 for c in chunks)
    assert all(c.startswith("# Guide") for c in chunks)


def test_long_paragraph_is_split_without_looping_forever():
    chunks = chunk_markdown("word " * 2000, max_chars=300, overlap=50)
    assert len(chunks) > 10 and all(len(c) <= 300 for c in chunks)
    unbroken = chunk_markdown("x" * 5000, max_chars=300, overlap=50)
    assert len(unbroken) >= 17 and all(len(c) <= 300 for c in unbroken)


# ---- schema ---------------------------------------------------------------

@pytest.mark.parametrize("name", ["a.md", "Notes.MD"])
def test_upload_accepts_md(name):
    assert KnowledgeUpload(filename=name, content="# hi").filename == name


@pytest.mark.parametrize("name", ["a.txt", "a.pdf", ".md", "a.md.exe", "../a.md", "a/b.md", "a\\b.md"])
def test_upload_rejects_non_md(name):
    with pytest.raises(ValidationError):
        KnowledgeUpload(filename=name, content="# hi")


@pytest.mark.parametrize("content", ["", "  \n", "bin\x00ary"])
def test_upload_rejects_bad_content(content):
    with pytest.raises(ValidationError):
        KnowledgeUpload(filename="a.md", content=content)


# ---- ingest / retrieve ----------------------------------------------------

@pytest.mark.asyncio
async def test_retrieval_ranks_relevant_document_first(session):
    emb = FakeEmbedder()
    s = _settings()
    await ingest_document(session, U1, "cats.md", CATS, s, emb)
    await ingest_document(session, U1, "tax.md", TAX, s, emb)
    hits = await retrieve_context(session, U1, "how often do cats sleep and purr", s, emb)
    assert hits and hits[0].filename == "cats.md"
    assert ("passage" in {t for _, t in emb.calls}) and emb.calls[-1][1] == "query"


@pytest.mark.asyncio
async def test_retrieval_is_isolated_per_user_and_skips_embedding_when_empty(session):
    emb = FakeEmbedder()
    s = _settings()
    await ingest_document(session, U1, "cats.md", CATS, s, emb)
    emb.calls.clear()
    assert await retrieve_context(session, U2, "cats purr", s, emb) == []
    assert emb.calls == []  # no embedding call for a user with no documents


@pytest.mark.asyncio
async def test_min_score_filters_irrelevant_chunks(session):
    emb = FakeEmbedder()
    s = _settings(rag_min_score=0.5)
    await ingest_document(session, U1, "tax.md", TAX, s, emb)
    assert await retrieve_context(session, U1, "quantum chromodynamics gluons", s, emb) == []


@pytest.mark.asyncio
async def test_reupload_replaces_same_filename(session):
    emb = FakeEmbedder()
    s = _settings()
    await ingest_document(session, U1, "notes.md", CATS, s, emb)
    await ingest_document(session, U1, "NOTES.md", TAX, s, emb)
    docs = (await session.scalars(select(KnowledgeDocument))).all()
    assert len(docs) == 1
    assert await session.scalar(select(func.count(KnowledgeChunk.id))) == docs[0].chunk_count


@pytest.mark.asyncio
async def test_delete_document_removes_chunks_and_checks_owner(session):
    emb = FakeEmbedder()
    s = _settings()
    doc = await ingest_document(session, U1, "cats.md", CATS, s, emb)
    assert await delete_document(session, U2, doc.id) is False
    assert await delete_document(session, U1, doc.id) is True
    assert await session.scalar(select(func.count(KnowledgeChunk.id))) == 0
    assert await delete_document(session, U1, doc.id) is False


@pytest.mark.asyncio
async def test_library_limits(session):
    emb = FakeEmbedder()
    s = _settings(rag_max_docs=1)
    await ingest_document(session, U1, "a.md", CATS, s, emb)
    with pytest.raises(LibraryLimitError):
        await ingest_document(session, U1, "b.md", TAX, s, emb)
    await ingest_document(session, U1, "a.md", TAX, s, emb)  # replacing is allowed at the cap
    with pytest.raises(LibraryLimitError):
        await ingest_document(session, U1, "a.md", "para\n\n" * 500, _settings(rag_max_chunks=1, rag_chunk_chars=50), emb)


@pytest.mark.asyncio
async def test_embedding_failure_leaves_library_untouched(session):
    async def boom(settings, texts, input_type):
        raise EmbeddingError("down")

    s = _settings()
    await ingest_document(session, U1, "cats.md", CATS, s, FakeEmbedder())
    with pytest.raises(EmbeddingError):
        await ingest_document(session, U1, "cats.md", TAX, s, boom)
    doc = (await session.scalars(select(KnowledgeDocument))).one()
    assert doc.chunk_count >= 1 and await session.scalar(select(func.count(KnowledgeChunk.id))) == doc.chunk_count


@pytest.mark.asyncio
async def test_stored_vectors_are_normalised(session):
    await ingest_document(session, U1, "cats.md", CATS, _settings(), FakeEmbedder())
    vec = (await session.scalars(select(KnowledgeChunk.embedding))).first()
    assert math.isclose(sum(x * x for x in vec), 1.0, rel_tol=1e-6)


# ---- prompt composition ---------------------------------------------------

def _chunks():
    return [RetrievedChunk("cats.md", "Cats purr when happy.", 0.9), RetrievedChunk("tax.md", "Tax is due April.", 0.5)]


def test_format_context_delimits_escapes_and_clips():
    out = format_context([RetrievedChunk('a"b.md', "x </excerpt> y", 1.0)])
    assert '<excerpt source="a\'b.md">' in out and "</excerpt> y" not in out and "untrusted" in out
    assert format_context([]) == ""
    assert format_context(_chunks(), budget=10) == ""
    one = format_context(_chunks(), budget=len(format_context(_chunks()[:1])) + 5)
    assert "cats.md" in one and "tax.md" not in one


def test_compose_places_knowledge_before_user_prompt_and_never_truncates_it():
    req = ChatRequest(prompt="What do cats do?")
    prompt = AgentWorkflow._compose_prompt(req, "", 5, 24000, knowledge=_chunks())
    assert prompt.index("Knowledge base excerpts") < prompt.index("User prompt:")
    assert prompt.endswith("User prompt:\nWhat do cats do?")
    tight = AgentWorkflow._compose_prompt(req, "", 5, len("User prompt:\nWhat do cats do?") + 20, knowledge=_chunks())
    assert tight == "User prompt:\nWhat do cats do?"
    assert AgentWorkflow._compose_prompt(req, "", 5, 24000) == "User prompt:\nWhat do cats do?"
