"""Development API for monitoring, explainable risk support, and care guidance."""
from __future__ import annotations

from datetime import date, datetime, timezone
import json
from pathlib import Path
from typing import Any
from uuid import uuid4

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

from explainability.explain import transformed_feature_names
from models.train_model import MODEL_PATH


PROJECT_ROOT = Path(__file__).resolve().parents[1]
STORE_PATH = PROJECT_ROOT / "data" / "processed" / "monitoring_records.json"
REMINDERS_PATH = PROJECT_ROOT / "data" / "processed" / "care_reminders.json"

app = FastAPI(
    title="AI Neonatal Emergency Assistant",
    version="0.1.0",
    description="Research decision-support API. It does not diagnose or replace clinicians.",
)


class NeonatalReading(BaseModel):
    infant_id: str = Field(min_length=1, max_length=80)
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    temperature_c: float = Field(gt=25, lt=45)
    heart_rate_bpm: int = Field(gt=0, lt=300)
    respiratory_rate_bpm: int = Field(gt=0, lt=150)
    oxygen_saturation: float = Field(gt=0, le=100)
    weight_kg: float = Field(gt=0, lt=15)
    feeding_frequency_per_day: int = Field(ge=0, le=30)
    sleeping_hours: float = Field(ge=0, le=24)
    vaccination_status: str = Field(min_length=1, max_length=80)
    symptoms: list[str] = Field(default_factory=list, max_length=20)


class ReminderRequest(BaseModel):
    infant_id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=120)
    due_date: date
    category: str = Field(default="care", min_length=1, max_length=40)


def _read_json(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []


def _write_json(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(records, indent=2), encoding="utf-8")


def _risk_level(reading: NeonatalReading) -> tuple[str, list[str]]:
    reasons: list[str] = []
    if reading.temperature_c < 36 or reading.temperature_c > 38:
        reasons.append("temperature outside the configured newborn review range")
    if reading.oxygen_saturation < 94:
        reasons.append("low oxygen saturation")
    if reading.heart_rate_bpm < 100 or reading.heart_rate_bpm > 180:
        reasons.append("heart rate outside the configured review range")
    if reading.respiratory_rate_bpm > 60:
        reasons.append("rapid breathing")
    if reading.feeding_frequency_per_day < 6:
        reasons.append("reduced feeding frequency")
    reasons.extend(f"reported symptom: {symptom}" for symptom in reading.symptoms)
    return ("urgent review" if reasons else "routine monitoring", reasons)


def _model_explanation(reading: NeonatalReading) -> dict[str, Any] | None:
    if not MODEL_PATH.exists():
        return None
    model = joblib.load(MODEL_PATH)
    preprocessor = model.named_steps["preprocessor"]
    feature_columns = preprocessor.feature_names_in_.tolist()
    categorical_columns = preprocessor.transformers_[1][2]
    encoder = preprocessor.named_transformers_["categorical"]
    categorical_defaults = {
        column: categories[0]
        for column, categories in zip(categorical_columns, encoder.categories_)
    }
    row: dict[str, Any] = {
        column: categorical_defaults.get(column, 0)
        for column in feature_columns
    }
    row.update({
        "temperature_c": reading.temperature_c,
        "heart_rate_bpm": reading.heart_rate_bpm,
        "respiratory_rate_bpm": reading.respiratory_rate_bpm,
        "oxygen_saturation": reading.oxygen_saturation,
        "weight_kg": reading.weight_kg,
        "feeding_frequency_per_day": reading.feeding_frequency_per_day,
    })
    model_input = pd.DataFrame([row], columns=feature_columns)
    prediction = model.predict(model_input)[0]
    class_index = list(model.classes_).index("at risk") if "at risk" in model.classes_ else 1
    return {
        "prediction": prediction,
        "probability_at_risk": float(model.predict_proba(model_input)[0, class_index]),
        "model_features": transformed_feature_names(model),
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model_status": "ready" if MODEL_PATH.exists() else "not trained"}


@app.post("/monitoring/readings", status_code=201)
def record_reading(reading: NeonatalReading) -> dict[str, Any]:
    records = _read_json(STORE_PATH)
    risk, reasons = _risk_level(reading)
    record = reading.model_dump(mode="json")
    record.update({
        "id": str(uuid4()),
        "risk_level": risk,
        "risk_reasons": reasons,
        "model": _model_explanation(reading),
    })
    records.append(record)
    _write_json(STORE_PATH, records)
    return {
        "record": record,
        "action": "contact emergency services now" if risk == "urgent review" else "continue scheduled monitoring",
        "warning": "Research decision support only. Contact a qualified clinician for any concern.",
    }


@app.get("/monitoring/{infant_id}")
def monitoring_history(infant_id: str) -> dict[str, Any]:
    readings = [record for record in _read_json(STORE_PATH) if record["infant_id"] == infant_id]
    readings.sort(key=lambda record: record["recorded_at"], reverse=True)
    return {"infant_id": infant_id, "count": len(readings), "readings": readings}


@app.post("/care/reminders", status_code=201)
def create_reminder(request: ReminderRequest) -> dict[str, Any]:
    reminders = _read_json(REMINDERS_PATH)
    reminder = request.model_dump(mode="json")
    reminder.update({"id": str(uuid4()), "created_at": datetime.now(timezone.utc).isoformat()})
    reminders.append(reminder)
    _write_json(REMINDERS_PATH, reminders)
    return reminder


@app.get("/care/{infant_id}")
def care_guidance(infant_id: str) -> dict[str, Any]:
    readings = [record for record in _read_json(STORE_PATH) if record["infant_id"] == infant_id]
    latest = max(readings, key=lambda record: record["recorded_at"]) if readings else None
    guidance = [
        "Keep feeding, sleep, temperature, and vaccination records up to date.",
        "Discuss any persistent change with the baby's clinician.",
    ]
    if latest and latest["risk_level"] == "urgent review":
        guidance.insert(0, "Seek urgent clinical assessment based on the latest recorded warning signs.")
    return {"infant_id": infant_id, "latest_reading": latest, "guidance": guidance, "reminder_window_days": 7}