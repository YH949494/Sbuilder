from flask import Blueprint, request, jsonify, send_file
from services.game_packager import build_game_zip

build_bp = Blueprint("build", __name__)


@build_bp.route("/package", methods=["POST"])
def package():
    """
    POST /api/build/package
    Body: full game config JSON
    Returns: zip file download
    """
    config = request.json
    if not config:
        return jsonify({"error": "config required"}), 400

    try:
        zip_path = build_game_zip(config)
        return send_file(
            zip_path,
            mimetype="application/zip",
            as_attachment=True,
            download_name=f"{config.get('game_title', 'slot_game')}.zip"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
