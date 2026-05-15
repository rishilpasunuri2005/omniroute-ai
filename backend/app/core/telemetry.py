import logging

from fastapi import FastAPI

from app.core.config import Settings

logger = logging.getLogger(__name__)


def configure_telemetry(app: FastAPI, settings: Settings) -> None:
    if settings.sentry_dsn:
        import sentry_sdk

        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.environment,
            traces_sample_rate=0.1,
            send_default_pii=False,
        )

    try:
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.trace import set_tracer_provider

        set_tracer_provider(TracerProvider(resource=Resource.create({"service.name": "omniroute-ai-backend"})))
        FastAPIInstrumentor.instrument_app(app)
    except Exception as exc:  # pragma: no cover - telemetry must not block app startup
        logger.warning("telemetry_configuration_failed error=%s", exc.__class__.__name__)

