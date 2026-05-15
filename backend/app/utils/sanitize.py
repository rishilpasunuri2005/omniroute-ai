import re

CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?([A-Za-z0-9_\-./=]{12,})"),
]


def sanitize_prompt(text: str, max_chars: int) -> str:
    cleaned = CONTROL_CHARS.sub("", text).strip()
    cleaned = cleaned[:max_chars]
    for pattern in SECRET_PATTERNS:
        cleaned = pattern.sub(r"\1=[REDACTED]", cleaned)
    return cleaned


def sanitize_output(text: str) -> str:
    cleaned = CONTROL_CHARS.sub("", text).strip()
    for pattern in SECRET_PATTERNS:
        cleaned = pattern.sub(r"\1=[REDACTED]", cleaned)
    return cleaned

