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

    # Determine task type — order matters (more specific first)
    is_debugging = any(term in text for term in {"bug", "debug", "stacktrace", "traceback", "error", "exception", "fix"})
    is_coding = any(term in text for term in CODING_TERMS)
    is_planning = any(term in text for term in PLANNING_TERMS)
    is_reasoning = any(term in text for term in REASONING_TERMS)
    is_extraction = any(term in text for term in EXTRACTION_TERMS)
    is_summary = any(term in text for term in SUMMARY_TERMS)

    if is_coding:
        task_type = "debugging" if is_debugging else "coding"
    elif is_planning:
        task_type = "planning"
    elif is_extraction:
        task_type = "extraction"
    elif is_summary:
        task_type = "summarization"
    elif is_reasoning:
        task_type = "reasoning"
    else:
        task_type = "summarization"

    # Compute complexity score
    complexity_score = 0
    complexity_score += 1 if word_count > 45 else 0
    complexity_score += 1 if word_count > 140 else 0
    complexity_score += 1 if "\n" in prompt or "```" in prompt else 0
    complexity_score += 1 if is_reasoning else 0
    complexity_score += 1 if task_type in {"coding", "debugging"} and word_count > 30 else 0
    complexity_score += 1 if len(re.findall(r"\b(first|then|after|before|because|therefore|if)\b", text)) >= 3 else 0
    # Planning tasks are inherently medium complexity
    complexity_score += 1 if is_planning else 0

    if complexity_score >= 4:
        complexity = "complex"
    elif complexity_score >= 2:
        complexity = "medium"
    else:
        complexity = "simple"

    # Base confidence: start higher when task type is clearly identified
    clearly_identified = is_coding or is_planning or is_extraction or is_summary or is_reasoning
    base_confidence = 0.72 if clearly_identified else 0.58

    confidence = min(0.95, base_confidence + (0.05 * complexity_score))

    # Boost confidence for unambiguous task types
    if task_type in {"coding", "debugging"}:
        confidence = max(confidence, 0.85)
    elif task_type == "planning":
        confidence = max(confidence, 0.78)
    elif task_type in {"extraction", "summarization"}:
        confidence = max(confidence, 0.75)

    return Classification(task_type=task_type, complexity=complexity, confidence=round(confidence, 2))

