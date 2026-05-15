from app.core.config import Settings
from app.router.classifier import classify_prompt
from app.schemas.routing import RouteResponse


class RoutingEngine:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def route(self, prompt: str) -> RouteResponse:
        classification = classify_prompt(prompt)
        mappings = self.settings.model_mappings

        if classification.task_type in {"coding", "debugging"}:
            selected_model = mappings["coding"]
            reason = "Coding and debugging prompts are routed to the coding-specialized model."
        elif classification.confidence < self.settings.route_confidence_threshold:
            selected_model = mappings["complex"]
            reason = "Low classifier confidence triggered escalation to the strongest reasoning model."
        elif classification.complexity == "complex":
            selected_model = mappings["complex"]
            reason = "Complex multi-step reasoning was routed to the reasoning model."
        elif classification.complexity == "medium":
            selected_model = mappings["medium"]
            reason = "Medium complexity work was routed to the balanced model."
        else:
            selected_model = mappings["simple"]
            reason = "Short or simple work was routed to the low-latency model."

        if selected_model == mappings["coding"]:
            provider_key = "coding"
        elif selected_model == mappings["complex"]:
            provider_key = "complex"
        elif selected_model == mappings["medium"]:
            provider_key = "medium"
        else:
            provider_key = "simple"

        return RouteResponse(
            classification=classification,
            selected_model=selected_model,
            provider=self.settings.provider_by_route[provider_key],
            fallback_model=mappings["fallback"],
            fallback_provider=self.settings.provider_by_route["fallback"],
            reason=reason,
        )
