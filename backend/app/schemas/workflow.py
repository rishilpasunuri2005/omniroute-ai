from pydantic import BaseModel, Field


class WorkflowCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    graph: dict = Field(default_factory=dict)


class WorkflowCreateResponse(BaseModel):
    id: str
    name: str
    description: str | None
    is_active: bool

