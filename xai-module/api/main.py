"""Development API for monitoring, explainable risk support, and care guidance."""
from __future__ import annotations

from datetime import date, datetime, timezone
import json
import logging
from pathlib import Path
from typing import Any
from uuid import uuid4

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

from explainability.explain import explain_prediction, explain_trend, explain_what_if, predict_input
from models.train_model import MODEL_PATH

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
STORE_PATH = PROJECT_ROOT / "data" / "processed" / "monitoring_records.json"
REMINDERS_PATH = PROJECT_ROOT / "data" / "processed" / "care_reminders.json"

DEMONSTRATION_THRESHOLDS = {
    "temperature_review_min_c": 36,
    "temperature_review_max_c": 38,
    "oxygen_saturation_review_min": 94,
    "heart_rate_review_min_bpm": 100,
    "heart_rate_review_max_bpm": 180,
    "respiratory_rate_review_max_bpm": 60,
    "feeding_frequency_review_min_per_day": 6,
}

app = FastAPI(
    title="AI Neonatal Emergency Assistant",
    version="0.1.0",
    description="Research decision-support API. It does not diagnose or replace clinicians.",
)


class NeonatalReading(BaseModel):
    infant_id: str = Field(min_length=1, max_length=80)
    simulated: bool = False
    recorded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    gender: str = Field(min_length=1, max_length=40)
    gestational_age_weeks: float = Field(gt=0, lt=50)
    birth_weight_kg: float = Field(gt=0, lt=15)
    birth_length_cm: float = Field(gt=0, lt=100)
    birth_head_circumference_cm: float = Field(gt=0, lt=100)
    age_days: int = Field(ge=0, le=3650)
    length_cm: float = Field(gt=0, lt=150)
    head_circumference_cm: float = Field(gt=0, lt=100)
    temperature_c: float = Field(gt=25, lt=45)
    heart_rate_bpm: int = Field(gt=0, lt=300)
    respiratory_rate_bpm: int = Field(gt=0, lt=150)
    oxygen_saturation: float = Field(gt=0, le=100)
    weight_kg: float = Field(gt=0, lt=15)
    feeding_type: str = Field(min_length=1, max_length=40)
    feeding_frequency_per_day: int = Field(ge=0, le=30)
    urine_output_count: int = Field(ge=0, le=100)
    stool_count: int = Field(ge=0, le=100)
    jaundice_level_mg_dl: float = Field(ge=0, lt=100)
    apgar_score: float = Field(ge=0, le=10)
    immunizations_done: int = Field(ge=0, le=1)
    reflexes_normal: int = Field(ge=0, le=1)
    sleeping_hours: float = Field(ge=0, le=24)
    vaccination_status: str = Field(min_length=1, max_length=80)
    symptoms: list[str] = Field(default_factory=list, max_length=20)


class ReminderRequest(BaseModel):
    infant_id: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=120)
    due_date: date
    category: str = Field(default="care", min_length=1, max_length=40)


class WhatIfRequest(BaseModel):
    reading: NeonatalReading
    changes: dict[str, float] = Field(min_length=1, max_length=10)


def _read_json(path: Path) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else []


def _write_json(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(records, indent=2), encoding="utf-8")


def _risk_level(reading: NeonatalReading) -> tuple[str, list[str]]:
    reasons: list[str] = []
    if (
        reading.temperature_c < DEMONSTRATION_THRESHOLDS["temperature_review_min_c"]
        or reading.temperature_c > DEMONSTRATION_THRESHOLDS["temperature_review_max_c"]
    ):
        reasons.append("temperature outside the configured newborn review range")
    if reading.oxygen_saturation < DEMONSTRATION_THRESHOLDS["oxygen_saturation_review_min"]:
        reasons.append("low oxygen saturation")
    if (
        reading.heart_rate_bpm < DEMONSTRATION_THRESHOLDS["heart_rate_review_min_bpm"]
        or reading.heart_rate_bpm > DEMONSTRATION_THRESHOLDS["heart_rate_review_max_bpm"]
    ):
        reasons.append("heart rate outside the configured review range")
    if reading.respiratory_rate_bpm > DEMONSTRATION_THRESHOLDS["respiratory_rate_review_max_bpm"]:
        reasons.append("rapid breathing")
    if reading.feeding_frequency_per_day < DEMONSTRATION_THRESHOLDS["feeding_frequency_review_min_per_day"]:
        reasons.append("reduced feeding frequency")
    reasons.extend(f"reported symptom: {symptom}" for symptom in reading.symptoms)
    return ("urgent review" if reasons else "routine monitoring", reasons)


def _model_input(reading: NeonatalReading) -> pd.DataFrame:
    model_fields = {
        "gender", "gestational_age_weeks", "birth_weight_kg", "birth_length_cm",
        "birth_head_circumference_cm", "age_days", "weight_kg", "length_cm",
        "head_circumference_cm", "temperature_c", "heart_rate_bpm",
        "respiratory_rate_bpm", "oxygen_saturation", "feeding_type",
        "feeding_frequency_per_day", "urine_output_count", "stool_count",
        "jaundice_level_mg_dl", "apgar_score", "immunizations_done", "reflexes_normal",
    }
    return pd.DataFrame([{key: value for key, value in reading.model_dump().items() if key in model_fields}])


def _model_prediction(reading: NeonatalReading) -> dict[str, Any] | None:
    if not MODEL_PATH.exists():
        return None
    return predict_input(_model_input(reading))


def _model_explanation(reading: NeonatalReading) -> dict[str, Any] | None:
    if not MODEL_PATH.exists():
        return None
    return explain_prediction(_model_input(reading))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model_status": "ready" if MODEL_PATH.exists() else "not trained"}


@app.get("/xai/global")
def global_explanation() -> dict[str, Any]:
    return explain_trend()


@app.post("/xai/what-if")
def what_if_explanation(request: WhatIfRequest) -> dict[str, Any]:
    return explain_what_if(_model_input(request.reading), request.changes)


@app.post("/monitoring/readings", status_code=201)
def record_reading(reading: NeonatalReading) -> dict[str, Any]:
    records = _read_json(STORE_PATH)
    risk, reasons = _risk_level(reading)
    record = reading.model_dump(mode="json")
    try:
        model_result = _model_prediction(reading)
        prediction_error = None
    except Exception as error:
        model_result = None
        prediction_error = str(error)
        logger.exception("Monitoring prediction failed")
    explanation = None
    explanation_error = None
    if model_result:
        try:
            explanation = _model_explanation(reading)
        except Exception as error:
            explanation_error = str(error)
            logger.exception("Monitoring SHAP explanation failed")
    if model_result:
        model_result["explanation"] = explanation
    record.update({
        "id": str(uuid4()),
        "risk_level": risk,
        "risk_reasons": reasons,
        "risk_basis": "demonstration thresholds and reported symptoms",
        "model": model_result,
        "explanation_status": "generated" if explanation else "failed",
        "prediction_status": "generated" if model_result else "failed",
        "prediction_error": prediction_error,
        "explanation_error": explanation_error,
    })
    records.append(record)
    _write_json(STORE_PATH, records)
    return {
        "record": record,
        "action": "seek urgent clinical assessment" if risk == "urgent review" else "continue scheduled monitoring",
        "warning": "Prototype demonstration alert. Research decision support; seek qualified clinical assessment for any concern.",
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