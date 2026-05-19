import asyncio
import logging
from dataclasses import dataclass

import httpx
from fastapi import HTTPException, status

from app.core.config import Settings
from app.services.token_counter import estimate_tokens
from app.utils.sanitize import sanitize_output, sanitize_prompt

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ProviderCompletion:
    text: str
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int


class AIProviderService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def generate(self, provider: str, model: str, prompt: str, system: str | None = None) -> ProviderCompletion:
        safe_prompt = sanitize_prompt(prompt, self.settings.max_prompt_chars)
        if provider == "groq":
            return await self._chat_completion(
                provider="groq",
                url="https://api.groq.com/openai/v1/chat/completions",
                api_key=self.settings.groq_api_key,
                model=model,
                prompt=safe_prompt,
                system=system,
                extra_headers={},
            )
        if provider == "openrouter":
            return await self._chat_completion(
                provider="openrouter",
                url="https://openrouter.ai/api/v1/chat/completions",
                api_key=self.settings.openrouter_api_key,
                model=model,
                prompt=safe_prompt,
                system=system,
                extra_headers={
                    "HTTP-Referer": self.settings.openrouter_site_url,
                    "X-Title": self.settings.openrouter_app_name,
                },
            )
        if provider in {"nvidia", "nvidia_nim", "nim"}:
            return await self._chat_completion(
                provider="nvidia",
                url=self.settings.nvidia_chat_completions_url,
                api_key=self.settings.nvidia_nim_api_key,
                model=model,
                prompt=safe_prompt,
                system=system,
                extra_headers={},
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported AI provider")

    async def _chat_completion(
        self,
        provider: str,
        url: str,
        api_key: str | None,
        model: str,
        prompt: str,
        system: str | None,
        extra_headers: dict[str, str],
    ) -> ProviderCompletion:
        if not api_key:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"{provider} provider is not configured")

        messages = []
        if system:
            messages.append({"role": "system", "content": sanitize_prompt(system, 4000)})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 2048,
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            **extra_headers,
        }

        last_error: Exception | None = None
        for attempt in range(self.settings.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.settings.ai_timeout_seconds) as client:
                    response = await client.post(url, json=payload, headers=headers)
                    response.raise_for_status()
                    data = response.json()
                text = data["choices"][0]["message"]["content"]
                usage = data.get("usage") or {}
                clean_text = sanitize_output(str(text))
                return ProviderCompletion(
                    text=clean_text,
                    provider=provider,
                    model=model,
                    prompt_tokens=int(usage.get("prompt_tokens") or estimate_tokens(prompt)),
                    completion_tokens=int(usage.get("completion_tokens") or estimate_tokens(clean_text)),
                )
            except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
                last_error = exc
                error_detail = str(exc)
                # Try to extract response body for better diagnostics
                if hasattr(exc, "response") and exc.response is not None:
                    try:
                        error_detail = exc.response.text[:500]
                    except Exception:
                        pass
                logger.warning(
                    "ai_provider_request_failed provider=%s model=%s attempt=%d error=%s",
                    provider, model, attempt + 1, error_detail[:200],
                )
                if attempt < self.settings.max_retries:
                    await asyncio.sleep(0.35 * (attempt + 1))

        error_msg = f"{provider}/{model} request failed after {self.settings.max_retries + 1} attempts"
        if last_error and hasattr(last_error, "response") and last_error.response is not None:
            try:
                resp_body = last_error.response.json()
                api_error = resp_body.get("error", {}).get("message", str(last_error))
                error_msg = f"{provider}: {api_error}"
            except Exception:
                error_msg = f"{provider}: HTTP {last_error.response.status_code}"
        logger.error("ai_provider_exhausted_retries provider=%s model=%s error=%s", provider, model, error_msg)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_msg,
        ) from last_error
