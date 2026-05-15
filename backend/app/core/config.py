from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "OmniRoute AI"
    environment: str = "development"
    api_prefix: str = "/api"
    frontend_origin: str = "http://localhost:3000"

    database_url: str = Field(
        default="postgresql+psycopg://omniroute:omniroute@localhost:5432/omniroute",
        validation_alias="DATABASE_URL",
    )
    ollama_base_url: str = Field(default="http://localhost:11434", validation_alias="OLLAMA_BASE_URL")
    ollama_timeout_seconds: float = 90.0
    ollama_strict: bool = False

    simple_model: str = "llama3"
    balanced_model: str = "mistral"
    coding_model: str = "deepseek-coder"
    reasoning_model: str = "deepseek-r1"
    fallback_model: str = "phi3"
    route_confidence_threshold: float = 0.62
    max_retries: int = 2

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def model_mappings(self) -> dict[str, str]:
        return {
            "simple": self.simple_model,
            "medium": self.balanced_model,
            "complex": self.reasoning_model,
            "coding": self.coding_model,
            "fallback": self.fallback_model,
        }


@lru_cache
def get_settings() -> Settings:
    return Settings()
