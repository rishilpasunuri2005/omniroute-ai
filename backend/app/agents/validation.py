import json

from app.schemas.routing import ValidationResult

_TERMINAL_PUNCTUATION = (".", "!", "?")


def _is_short_factual_answer(text: str) -> bool:
    # A short reply that ends with terminal punctuation ("Yes.", "42.") or is
    # a single alphanumeric token ("42", "Yes", "N/A") reads as a complete
    # short answer, not a truncated response.
    if text.endswith(_TERMINAL_PUNCTUATION):
        return True
    return text.replace(" ", "").isalnum()


class ValidationAgent:
    def validate(self, response: str, expected_json: bool = False) -> ValidationResult:
        issues: list[str] = []
        stripped = response.strip()

        if not stripped:
            issues.append("empty_response")
        # Only flag as incomplete if truly tiny AND not a short factual answer
        if len(stripped) < 8 and not _is_short_factual_answer(stripped):
            issues.append("possibly_incomplete_output")
        if expected_json:
            try:
                json.loads(stripped)
            except json.JSONDecodeError:
                issues.append("malformed_json")
        if any(marker in stripped.lower() for marker in ["i made this up", "not sure but", "as an ai language model"]):
            issues.append("hallucination_risk_marker")

        risk_level = "high" if "empty_response" in issues or "malformed_json" in issues else "medium" if issues else "low"
        return ValidationResult(passed=not issues, risk_level=risk_level, issues=issues)

