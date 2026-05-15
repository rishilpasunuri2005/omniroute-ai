import math


def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return max(1, math.ceil(len(text) / 4))


def estimate_local_cost(total_tokens: int) -> float:
    # Local Ollama inference has no API token charge; this represents compute accounting.
    return round(total_tokens * 0.0000002, 6)


def estimate_cost_savings(total_tokens: int) -> float:
    hosted_baseline = total_tokens * 0.000006
    local_estimate = estimate_local_cost(total_tokens)
    return round(max(hosted_baseline - local_estimate, 0), 6)

