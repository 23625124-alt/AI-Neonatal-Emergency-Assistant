"""MongoDB storage with a local JSON fallback for development."""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv


load_dotenv()


logger = logging.getLogger(__name__)


def _json_safe(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, tuple):
        return tuple(_json_safe(item) for item in value)
    if type(value).__name__ == "ObjectId" and value.__class__.__module__ == "bson.objectid":
        return str(value)
    return value


class DataStore:
    def __init__(self, project_root: Path) -> None:
        self.mongo_uri = os.getenv("MONGODB_URI", "").strip()
        self.database_name = os.getenv("MONGODB_DATABASE", "neonatal_xai")
        self.project_root = project_root
        self._client: Any = None
        self._database: Any = None
        if self.mongo_uri:
            try:
                from pymongo import MongoClient

                self._client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=3000)
                self._client.admin.command("ping")
                self._database = self._client[self.database_name]
            except Exception as error:
                logger.warning("MongoDB unavailable; using local JSON storage: %s", error)
                if self._client is not None:
                    self._client.close()
                self._client = None
                self._database = None

    @property
    def backend(self) -> str:
        return "mongodb" if self._database is not None else "json"

    def read(self, path: Path, collection: str) -> list[dict[str, Any]]:
        if self._database is not None:
            return [_json_safe(record) for record in self._database[collection].find({}, {"_id": 0})]
        return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []

    def append(self, path: Path, collection: str, record: dict[str, Any]) -> None:
        if self._database is not None:
            self._database[collection].insert_one(record)
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        records = self.read(path, collection)
        records.append(record)
        path.write_text(json.dumps(records, indent=2), encoding="utf-8")

    def replace(self, path: Path, collection: str, records: list[dict[str, Any]]) -> None:
        if self._database is not None:
            self._database[collection].delete_many({})
            if records:
                self._database[collection].insert_many(records)
            return
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(records, indent=2), encoding="utf-8")

    def find_one(self, path: Path, collection: str, field: str, value: str) -> dict[str, Any] | None:
        if self._database is not None:
            record = self._database[collection].find_one({field: value}, {"_id": 0})
            return _json_safe(record) if record is not None else None
        return next((item for item in self.read(path, collection) if item.get(field) == value), None)
