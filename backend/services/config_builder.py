import json
import re
import os

SHELLS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "game-shells")


def build_config(shell_name: str, user_config: dict) -> dict:
    """Load config.template.json for shell and merge user_config values into it."""
    template_path = os.path.join(SHELLS_DIR, shell_name, "config.template.json")
    with open(template_path) as f:
        template_str = f.read()

    def replacer(match):
        path = match.group(1).strip()
        return str(_get_nested(user_config, path.split("."))) or match.group(0)

    merged_str = re.sub(r"\{\{(.*?)\}\}", replacer, template_str)
    return json.loads(merged_str)


def _get_nested(obj: dict, keys: list):
    for key in keys:
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj
