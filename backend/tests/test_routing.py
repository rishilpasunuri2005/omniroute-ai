from app.router.classifier import classify_prompt
from app.router.engine import RoutingEngine
from app.core.config import Settings


def test_coding_prompt_routes_to_coding_model():
    engine = RoutingEngine(Settings())
    route = engine.route("Fix this Python traceback and explain the bug")
    assert route.classification.task_type == "debugging"
    assert route.selected_model == "deepseek/deepseek-coder"
    assert route.provider == "openrouter"


def test_simple_prompt_classifies_simple():
    result = classify_prompt("Summarize this paragraph in one sentence.")
    assert result.complexity == "simple"
    assert result.task_type == "summarization"
