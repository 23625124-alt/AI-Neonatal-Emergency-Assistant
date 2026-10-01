"""MongoDB storage with a local JSON fallback for development."""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


class DataStore:
    def __init__(self, project_root: Path) -> None:
        self.mongo_uri = os.getenv("MONGODB_URI", "").strip()
        self.database_name = os.getenv("MONGODB_DATABASE", "neonatal_xai")
        self.project_root = project_root
        self._database: Any = None
        if self.mongo_uri:
            try:
                from pymongo import MongoClient

                client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=3000)
                client.admin.command("ping")
                self._database = client[self.database_name]
            except Exception:
                self._database = None

    @property
    def backend(self) -> str:
        return "mongodb" if self._database is not None else "json"

    def read(self, path: Path, collection: str) -> list[dict[str, Any]]:
        if self._database is not None:
            return list(self._database[collection].find({}, {"_id": 0}))
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
            return self._database[collection].find_one({field: value}, {"_id": 0})
        return next((item for item in self.read(path, collection) if item.get(field) == value), None)
