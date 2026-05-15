from pydantic import BaseModel, Field, field_validator

from app.schemas.routing import Classification, ValidationResult


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=12000)

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in {"user", "assistant"}:
            raise ValueError("role must be user or assistant")
        return value


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=24000)
    conversation_id: str | None = None
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
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
