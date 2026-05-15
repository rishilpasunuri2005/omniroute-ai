from pydantic import BaseModel, Field

from app.schemas.routing import Classification, ValidationResult


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=24000)
    conversation_id: str | None = None
    history: list[ChatMessage] = Field(default_factory=list)
    stream: bool = False


class Usage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class WorkflowStep(BaseModel):
    agent: str
    status: str
    detail: str


class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    model_used: str
    latency_ms: int
    usage: Usage
    classification: Classification
    validation: ValidationResult
    workflow_trace: list[WorkflowStep]
    estimated_cost: float

