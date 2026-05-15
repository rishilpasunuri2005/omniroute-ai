import asyncio
import json
import logging
from collections.abc import AsyncGenerator

import httpx

from app.core.config import Settings

logger = logging.getLogger(__name__)


class OllamaService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.base_url = settings.ollama_base_url.rstrip("/")

    async def list_models(self) -> list[str]:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                payload = response.json()
                return [item["name"].split(":")[0] for item in payload.get("models", [])]
        except httpx.HTTPError as exc:
            logger.warning("ollama_list_models_failed error=%s", exc)
            return []

    async def generate(self, model: str, prompt: str, system: str | None = None) -> str:
        payload = {"model": model, "prompt": prompt, "stream": False}
        if system:
            payload["system"] = system

        for attempt in range(self.settings.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.settings.ollama_timeout_seconds) as client:
                    response = await client.post(f"{self.base_url}/api/generate", json=payload)
                    response.raise_for_status()
                    return str(response.json().get("response", "")).strip()
            except httpx.HTTPError as exc:
                logger.warning("ollama_generate_failed model=%s attempt=%s error=%s", model, attempt + 1, exc)
                if attempt >= self.settings.max_retries:
                    if self.settings.ollama_strict:
                        raise
                    return self._offline_response(model, prompt)
                await asyncio.sleep(0.35 * (attempt + 1))
        return self._offline_response(model, prompt)

    async def stream_generate(self, model: str, prompt: str, system: str | None = None) -> AsyncGenerator[str, None]:
        payload = {"model": model, "prompt": prompt, "stream": True}
        if system:
            payload["system"] = system
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        chunk = json.loads(line)
                        if chunk.get("response"):
                            yield str(chunk["response"])
                        if chunk.get("done"):
                            break
        except (httpx.HTTPError, json.JSONDecodeError) as exc:
            logger.warning("ollama_stream_failed model=%s error=%s", model, exc)
            if self.settings.ollama_strict:
                raise
            yield self._offline_response(model, prompt)

    @staticmethod
    def _offline_response(model: str, prompt: str) -> str:
        return (
            f"[Offline Ollama fallback via {model}] I could not reach the local Ollama runtime. "
            "The router and workflow executed successfully, but model inference is simulated. "
            f"Prompt summary: {prompt[:240]}"
        )

