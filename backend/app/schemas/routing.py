from typing import Literal

from pydantic import BaseModel, Field

TaskType = Literal["summarization", "coding", "reasoning", "extraction", "planning", "debugging"]
Complexity = Literal["simple", "medium", "complex"]


class Classification(BaseModel):
    task_type: TaskType
    complexity: Complexity
    confidence: float = Field(ge=0.0, le=1.0)


class RouteRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=24000)


class RouteResponse(BaseModel):
    classification: Classification
    selected_model: str
    provider: str
    fallback_model: str
    fallback_provider: str
    reason: str


class ValidationResult(BaseModel):
    passed: bool
    risk_level: Literal["low", "medium", "high"]
    issues: list[str] = Field(default_factory=list)
