from flask import Blueprint, send_from_directory
import os

preview_bp = Blueprint("preview", __name__)

SHELLS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "game-shells")


@preview_bp.route("/<shell_name>/<path:filename>")
def serve_shell(shell_name, filename):
    """Serve static files for a game shell during preview."""
    shell_path = os.path.join(SHELLS_DIR, shell_name)
    return send_from_directory(shell_path, filename)


@preview_bp.route("/<shell_name>/")
def serve_shell_index(shell_name):
    """Serve shell index.html."""
    shell_path = os.path.join(SHELLS_DIR, shell_name)
    return send_from_directory(shell_path, "index.html")
