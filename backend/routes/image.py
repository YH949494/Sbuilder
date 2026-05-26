from flask import Blueprint, request, jsonify
from services.image_pipeline import generate_and_process
from services.asset_manager import upload_asset_from_file
import uuid

image_bp = Blueprint("image", __name__)


@image_bp.route("/generate", methods=["POST"])
def generate():
    """
    POST /api/image/generate
    Body: { prompt: str, slot_id: str, game_id: str }
    Returns: { url: str, slot_id: str }
    """
    data = request.json
    prompt = data.get("prompt")
    slot_id = data.get("slot_id")
    game_id = data.get("game_id") or str(uuid.uuid4())

    if not prompt or not slot_id:
        return jsonify({"error": "prompt and slot_id required"}), 400

    try:
        result_url = generate_and_process(
            prompt=prompt,
            slot_id=slot_id,
            game_id=game_id
        )
        return jsonify({"url": result_url, "slot_id": slot_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@image_bp.route("/upload", methods=["POST"])
def upload():
    """
    POST /api/image/upload
    Multipart: file, slot_id, game_id
    Returns: { url: str, slot_id: str }
    """
    slot_id = request.form.get("slot_id")
    game_id = request.form.get("game_id") or str(uuid.uuid4())
    file = request.files.get("file")

    if not slot_id or not file:
        return jsonify({"error": "file and slot_id required"}), 400

    try:
        raw_bytes = file.read()
        url = upload_asset_from_file(
            file_bytes=raw_bytes,
            key=f"games/{game_id}/symbols/{slot_id}.png",
            content_type="image/png"
        )
        return jsonify({"url": url, "slot_id": slot_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
