import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, JSON, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def _uuid_str() -> str:
    return str(uuid.uuid4())


class ConversationTurn(Base):
    __tablename__ = "conversation_turns"

    id: Mapped[str] = mapped_column(Uuid(as_uuid=False), primary_key=True, default=_uuid_str)
    conversation_id: Mapped[str] = mapped_column(String(80), index=True)
    prompt: Mapped[str] = mapped_column(Text)
    response: Mapped[str] = mapped_column(Text)
    task_type: Mapped[str] = mapped_column(String(40), index=True)
    complexity: Mapped[str] = mapped_column(String(24), index=True)
    model_used: Mapped[str] = mapped_column(String(80), index=True)
    confidence: Mapped[float] = mapped_column(Float)
    prompt_tokens: Mapped[int] = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0.0)
    validation: Mapped[dict] = mapped_column(JSON, default=dict)
    workflow_trace: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)
