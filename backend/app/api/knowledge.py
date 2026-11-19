import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.models.knowledge import KnowledgeDocument
from app.schemas.knowledge import KnowledgeDocumentOut, KnowledgeUpload
from app.security.auth import AuthContext, get_current_user
from app.security.rate_limit import limiter
from app.services.rag import EmbeddingError, LibraryLimitError, delete_document, ingest_document
from app.services.users import get_or_create_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


def _out(document: KnowledgeDocument) -> KnowledgeDocumentOut:
    return KnowledgeDocumentOut(
        id=str(document.id),
        filename=document.filename,
        char_count=document.char_count,
        chunk_count=document.chunk_count,
        created_at=document.created_at,
    )


@router.get("", response_model=list[KnowledgeDocumentOut])
@limiter.limit("60/minute")
async def list_documents(
    request: Request,
    response: Response,
    user: Annotated[AuthContext, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> list[KnowledgeDocumentOut]:
    db_user = await get_or_create_user(session, user, settings)
    rows = await session.scalars(
        select(KnowledgeDocument).where(KnowledgeDocument.user_id == db_user.id).order_by(KnowledgeDocument.created_at.desc())
    )
    return [_out(document) for document in rows]


@router.post("", response_model=KnowledgeDocumentOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def upload_document(
    request: Request,
    response: Response,
    payload: KnowledgeUpload,
    user: Annotated[AuthContext, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> KnowledgeDocumentOut:
    db_user = await get_or_create_user(session, user, settings)
    try:
        document = await ingest_document(session, db_user.id, payload.filename, payload.content, settings)
    except LibraryLimitError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except EmbeddingError as exc:
        logger.error("knowledge_embedding_failed error=%s", exc)
        status_code = 503 if "not configured" in str(exc) else 502
        raise HTTPException(status_code=status_code, detail="Embedding service is unavailable. Try again shortly.") from exc
    return _out(document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def remove_document(
    request: Request,
    document_id: str,
    user: Annotated[AuthContext, Depends(get_current_user)],
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> Response:
    db_user = await get_or_create_user(session, user, settings)
    if not await delete_document(session, db_user.id, document_id):
        raise HTTPException(status_code=404, detail="Document not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
