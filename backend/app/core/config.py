from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "OmniRoute AI"
    environment: str = "development"
    api_prefix: str = "/api"
    frontend_origin: str = "http://localhost:3000"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000,https://omniroute-ai.vercel.app"
    auth_required: bool = False
    clerk_issuer: str | None = Field(default=None, validation_alias="CLERK_ISSUER")
    clerk_jwks_url: str | None = Field(default=None, validation_alias="CLERK_JWKS_URL")
    clerk_audience: str | None = Field(default=None, validation_alias="CLERK_AUDIENCE")

    database_url: str = Field(
        default="postgresql+psycopg://omniroute:omniroute@localhost:5432/omniroute",
        validation_alias="DATABASE_URL",
    )
    groq_api_key: str | None = Field(default=None, validation_alias="GROQ_API_KEY")
    openrouter_api_key: str | None = Field(default=None, validation_alias="OPENROUTER_API_KEY")
    openrouter_site_url: str = Field(default="http://localhost:3000", validation_alias="OPENROUTER_SITE_URL")
    openrouter_app_name: str = Field(default="OmniRoute AI", validation_alias="OPENROUTER_APP_NAME")
    nvidia_nim_api_key: str | None = Field(default=None, validation_alias="NVIDIA_NIM_API_KEY")
    nvidia_nim_base_url: str = Field(default="https://integrate.api.nvidia.com/v1", validation_alias="NVIDIA_NIM_BASE_URL")
    ai_timeout_seconds: float = 120.0

    simple_model: str = "llama-3.1-8b-instant"
    balanced_model: str = "llama-3.3-70b-versatile"
    coding_model: str = "deepseek/deepseek-coder"
    reasoning_model: str = "deepseek/deepseek-r1"
    fallback_model: str = "google/gemini-2.5-flash"
    simple_provider: str = Field(default="groq", validation_alias="SIMPLE_PROVIDER")
    balanced_provider: str = Field(default="groq", validation_alias="BALANCED_PROVIDER")
    coding_provider: str = Field(default="openrouter", validation_alias="CODING_PROVIDER")
    reasoning_provider: str = Field(default="openrouter", validation_alias="REASONING_PROVIDER")
    fallback_provider: str = Field(default="openrouter", validation_alias="FALLBACK_PROVIDER")
    route_confidence_threshold: float = 0.62
    max_retries: int = 2
    max_prompt_chars: int = 24000
    max_history_messages: int = 20
    max_request_bytes: int = 512_000
    per_user_daily_token_budget: int = 100_000

    sentry_dsn: str | None = Field(default=None, validation_alias="SENTRY_DSN")
    langsmith_api_key: str | None = Field(default=None, validation_alias="LANGSMITH_API_KEY")
    langsmith_project: str = "omniroute-ai"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url.startswith("postgresql+"):
            return self.database_url
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+psycopg://", 1)
        return self.database_url

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def model_mappings(self) -> dict[str, str]:
        return {
            "simple": self.simple_model,
            "medium": self.balanced_model,
            "reasoning": self.reasoning_model,
            "coding": self.coding_model,
            "fallback": self.fallback_model,
        }

    @property
    def provider_by_route(self) -> dict[str, str]:
        return {
            "simple": self.simple_provider,
            "medium": self.balanced_provider,
            "reasoning": self.reasoning_provider,
            "coding": self.coding_provider,
            "fallback": self.fallback_provider,
        }

    @property
    def nvidia_chat_completions_url(self) -> str:
        base_url = self.nvidia_nim_base_url.rstrip("/")
        if base_url.endswith("/chat/completions"):
            return base_url
        return f"{base_url}/chat/completions"


@lru_cache
def get_settings() -> Settings:
    return Settings()
