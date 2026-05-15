from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    total_requests: int
    total_tokens: int
    average_latency_ms: float
    estimated_cost: float
    estimated_cost_savings: float
    routing_distribution: dict[str, int]
    model_utilization: dict[str, int]
    task_type_distribution: dict[str, int]
    recent_activity: list[dict]


class ModelInfo(BaseModel):
    name: str
    role: str
    provider: str = "ollama"
    available: bool
    context_window: int | None = None

