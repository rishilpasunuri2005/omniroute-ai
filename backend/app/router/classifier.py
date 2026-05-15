import re

from app.schemas.routing import Classification


CODING_TERMS = {
    "code",
    "function",
    "typescript",
    "python",
    "react",
    "fastapi",
    "bug",
    "debug",
    "stacktrace",
    "sql",
    "api",
    "compile",
}
REASONING_TERMS = {"analyze", "reason", "tradeoff", "architecture", "derive", "prove", "optimize", "strategy"}
PLANNING_TERMS = {"plan", "roadmap", "milestone", "workflow", "orchestrate", "steps"}
EXTRACTION_TERMS = {"extract", "parse", "json", "csv", "fields", "entities"}
SUMMARY_TERMS = {"summarize", "summary", "tl;dr", "condense"}


def classify_prompt(prompt: str) -> Classification:
    text = prompt.lower()
    words = re.findall(r"[a-z0-9_#+.-]+", text)
    word_count = len(words)

    if any(term in text for term in CODING_TERMS):
        task_type = "debugging" if any(term in text for term in {"bug", "debug", "stacktrace", "traceback"}) else "coding"
    elif any(term in text for term in PLANNING_TERMS):
        task_type = "planning"
    elif any(term in text for term in EXTRACTION_TERMS):
        task_type = "extraction"
    elif any(term in text for term in SUMMARY_TERMS):
        task_type = "summarization"
    else:
        task_type = "reasoning" if any(term in text for term in REASONING_TERMS) else "summarization"

    complexity_score = 0
    complexity_score += 1 if word_count > 45 else 0
    complexity_score += 1 if word_count > 140 else 0
    complexity_score += 1 if "\n" in prompt or "```" in prompt else 0
    complexity_score += 1 if any(term in text for term in REASONING_TERMS | PLANNING_TERMS) else 0
    complexity_score += 1 if task_type in {"coding", "debugging"} and word_count > 30 else 0
    complexity_score += 1 if len(re.findall(r"\b(first|then|after|before|because|therefore|if)\b", text)) >= 3 else 0

    if complexity_score >= 4:
        complexity = "complex"
    elif complexity_score >= 2:
        complexity = "medium"
    else:
        complexity = "simple"

    confidence = min(0.95, 0.52 + (0.08 * complexity_score))
    if task_type in {"coding", "debugging"}:
        confidence = max(confidence, 0.82)

    return Classification(task_type=task_type, complexity=complexity, confidence=round(confidence, 2))

