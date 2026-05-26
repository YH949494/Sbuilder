import os
import json
import shutil
import tempfile
import zipfile
from services.config_builder import build_config

SHELLS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "game-shells")


def build_game_zip(user_config: dict) -> str:
    """
    1. Resolve which shell to use
    2. Build merged config.json
    3. Copy shell files into a temp dir
    4. Write config.json into temp dir
    5. Zip and return path to zip file
    """
    shell_name = user_config.get("shell", "shell_5x3_243ways")
    shell_src = os.path.join(SHELLS_DIR, shell_name)

    if not os.path.isdir(shell_src):
        raise ValueError(f"Unknown shell: {shell_name}")

    merged_config = build_config(shell_name, user_config)

    tmp_dir = tempfile.mkdtemp()
    game_dir = os.path.join(tmp_dir, "game")
    shutil.copytree(shell_src, game_dir)

    with open(os.path.join(game_dir, "config.json"), "w") as f:
        json.dump(merged_config, f, indent=2)

    zip_path = os.path.join(tmp_dir, "game.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(game_dir):
            for fname in files:
                full = os.path.join(root, fname)
                arcname = os.path.relpath(full, game_dir)
                zf.write(full, arcname)

    return zip_path
