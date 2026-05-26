from flask import Blueprint, request, jsonify
from services.db import get_collection
from bson import ObjectId
import uuid

config_bp = Blueprint("config", __name__)


def _serialize(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


@config_bp.route("/save", methods=["POST"])
def save():
    """
    POST /api/config/save
    Body: full game config JSON
    Returns: { game_id: str }
    """
    data = request.json
    if not data:
        return jsonify({"error": "config required"}), 400

    col = get_collection("game_configs")
    game_id = data.get("game_id") or str(uuid.uuid4())
    data["game_id"] = game_id

    existing = col.find_one({"game_id": game_id})
    if existing:
        col.replace_one({"game_id": game_id}, data)
    else:
        col.insert_one(data)

    return jsonify({"game_id": game_id})


@config_bp.route("/<game_id>", methods=["GET"])
def load(game_id):
    """GET /api/config/<game_id> — load saved config"""
    col = get_collection("game_configs")
    doc = col.find_one({"game_id": game_id}, {"_id": 0})
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify(doc)


@config_bp.route("/list", methods=["GET"])
def list_configs():
    """GET /api/config/list — list all saved games (summary only)"""
    col = get_collection("game_configs")
    docs = list(col.find(
        {},
        {"game_id": 1, "game_title": 1, "shell": 1, "_id": 0}
    ).sort("game_title", 1).limit(50))
    return jsonify(docs)


@config_bp.route("/<game_id>", methods=["DELETE"])
def delete(game_id):
    """DELETE /api/config/<game_id>"""
    col = get_collection("game_configs")
    result = col.delete_one({"game_id": game_id})
    if result.deleted_count == 0:
        return jsonify({"error": "not found"}), 404
    return jsonify({"deleted": True})
