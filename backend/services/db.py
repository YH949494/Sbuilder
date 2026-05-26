import os
from pymongo import MongoClient
from pymongo.collection import Collection

_client: MongoClient | None = None


def get_db():
    global _client
    if _client is None:
        uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return _client[os.environ.get("MONGODB_DB", "slotforge")]


def get_collection(name: str) -> Collection:
    return get_db()[name]
