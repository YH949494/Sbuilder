import json
import re
import os

SHELLS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "game-shells")


def build_config(shell_name: str, user_config: dict) -> dict:
    """Load config.template.json and replace {{path}} placeholders with real values."""
    template_path = os.path.join(SHELLS_DIR, shell_name, "config.template.json")
    with open(template_path) as f:
        template = json.load(f)

    return _replace(template, user_config)


def _replace(obj, user_config):
    """Recursively walk template, replacing placeholder strings with real values."""
    if isinstance(obj, dict):
        return {k: _replace(v, user_config) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_replace(item, user_config) for item in obj]
    if isinstance(obj, str):
        # Pure placeholder: "{{some.path}}" → return actual Python value (preserves type)
        pure = re.fullmatch(r'\{\{([\w.]+)\}\}', obj.strip())
        if pure:
            return _get_nested(user_config, pure.group(1).split("."))

        # Inline placeholder inside a string: "hello {{name}}" → string interpolation
        def sub(m):
            val = _get_nested(user_config, m.group(1).split("."))
            return "" if val is None else str(val)

        return re.sub(r'\{\{([\w.]+)\}\}', sub, obj)
    return obj


def _get_nested(obj, keys: list):
    for key in keys:
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj
