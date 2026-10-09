"""Development API for monitoring, explainable risk support, and care guidance."""

from __future__ import annotations

from datetime import date, datetime, timezone
import logging
from pathlib import Path
from typing import Any
from uuid import uuid4

import pandas as pd
from fastapi import FastAPI, HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel, Field

from explainability.explain import (
    explain_prediction,
    explain_trend,
    explain_what_if,
    predict_input,
)
from models.train_model import MODEL_PATH
from api.storage import DataStore, _json_safe


logger = logging.getLogger(__name__)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]


STORE_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "monitoring_records.json"
)


REMINDERS_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "care_reminders.json"
)


BABIES_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "baby_profiles.json"
)

FEEDING_LOGS_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "feeding_logs.json"
)


USERS_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "user_accounts.json"
)


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
    version="0.2.0",
    description=(
        "Hospital-oriented research decision-support API "
        "for neonatal monitoring, explainable risk support, "
        "care guidance, and user access management. "
        "It does not diagnose or replace clinicians."
    ),
)


STORE = DataStore(PROJECT_ROOT)


# ============================================================
# DATA MODELS
# ============================================================


class BabyProfile(BaseModel):
    """
    Basic baby profile.

    Age is calculated automatically from date_of_birth.
    """

    baby_id: str = Field(
        min_length=1,
        max_length=80,
    )

    baby_name: str = Field(
        min_length=1,
        max_length=80,
    )

    date_of_birth: date

    sex: str = Field(
        min_length=1,
        max_length=20,
    )

    gestational_age_weeks: float = Field(
        gt=20,
        lt=45,
    )

    birth_weight_kg: float = Field(
        gt=0,
        lt=10,
    )

    birth_length_cm: float = Field(
        gt=20,
        lt=70,
    )

    birth_head_circumference_cm: float = Field(
        gt=20,
        lt=50,
    )

    feeding_type: str = Field(
        min_length=1,
        max_length=40,
    )

    parent_name: str = Field(
        min_length=1,
        max_length=100,
    )

    hospital_name: str = Field(
        min_length=1,
        max_length=150,
    )


class UserAccount(BaseModel):
    """
    Parent or hospital staff account.

    Password is accepted during registration/login,
    but only its bcrypt hash is stored.
    """

    username: str = Field(
        min_length=3,
        max_length=50,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    full_name: str = Field(
        min_length=1,
        max_length=100,
    )

    role: str = Field(
        min_length=1,
        max_length=30,
    )

    phone: str = Field(
        min_length=7,
        max_length=20,
    )

    email: str = Field(
        min_length=5,
        max_length=150,
    )

    baby_id: str = Field(
        min_length=1,
        max_length=80,
    )


class UserLogin(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=50,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )
class QuickReadingPayload(BaseModel):
    infant_id: str = Field(
        min_length=1,
        max_length=80,
    )

    simulated: bool = False

    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    age_days: int = Field(
        ge=0,
        le=3650,
    )

    length_cm: float = Field(
        gt=0,
        lt=150,
    )

    head_circumference_cm: float = Field(
        gt=0,
        lt=100,
    )

    temperature_c: float = Field(
        gt=25,
        lt=45,
    )

    heart_rate_bpm: int = Field(
        gt=0,
        lt=300,
    )

    respiratory_rate_bpm: int = Field(
        gt=0,
        lt=150,
    )

    oxygen_saturation: float = Field(
        gt=0,
        le=100,
    )

    weight_kg: float = Field(
        gt=0,
        lt=15,
    )

    feeding_frequency_per_day: int = Field(
        ge=0,
        le=30,
    )

    urine_output_count: int = Field(
        ge=0,
        le=100,
    )

    stool_count: int = Field(
        ge=0,
        le=100,
    )

    jaundice_level_mg_dl: float = Field(
        ge=0,
        lt=100,
    )

    immunizations_done: int = Field(
        ge=0,
        le=1,
    )

    reflexes_normal: int = Field(
        ge=0,
        le=1,
    )

    sleeping_hours: float = Field(
        ge=0,
        le=24,
    )

    symptoms: list[str] = Field(
        default_factory=list,
        max_length=20,
    )

class NeonatalReading(BaseModel):
    infant_id: str = Field(
        min_length=1,
        max_length=80,
    )

    simulated: bool = False

    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    gender: str = Field(
        min_length=1,
        max_length=40,
    )

    gestational_age_weeks: float = Field(
        gt=0,
        lt=50,
    )

    birth_weight_kg: float = Field(
        gt=0,
        lt=15,
    )

    birth_length_cm: float = Field(
        gt=0,
        lt=100,
    )

    birth_head_circumference_cm: float = Field(
        gt=0,
        lt=100,
    )

    age_days: int = Field(
        ge=0,
        le=3650,
    )

    length_cm: float = Field(
        gt=0,
        lt=150,
    )

    head_circumference_cm: float = Field(
        gt=0,
        lt=100,
    )

    temperature_c: float = Field(
        gt=25,
        lt=45,
    )

    heart_rate_bpm: int = Field(
        gt=0,
        lt=300,
    )

    respiratory_rate_bpm: int = Field(
        gt=0,
        lt=150,
    )

    oxygen_saturation: float = Field(
        gt=0,
        le=100,
    )

    weight_kg: float = Field(
        gt=0,
        lt=15,
    )

    feeding_type: str = Field(
        min_length=1,
        max_length=40,
    )

    feeding_frequency_per_day: int = Field(
        ge=0,
        le=30,
    )

    urine_output_count: int = Field(
        ge=0,
        le=100,
    )

    stool_count: int = Field(
        ge=0,
        le=100,
    )

    jaundice_level_mg_dl: float = Field(
        ge=0,
        lt=100,
    )

    apgar_score: float = Field(
        ge=0,
        le=10,
    )

    immunizations_done: int = Field(
        ge=0,
        le=1,
    )

    reflexes_normal: int = Field(
        ge=0,
        le=1,
    )

    sleeping_hours: float = Field(
        ge=0,
        le=24,
    )

    vaccination_status: str = Field(
        min_length=1,
        max_length=80,
    )

    symptoms: list[str] = Field(
        default_factory=list,
        max_length=20,
    )


class ReminderRequest(BaseModel):
    infant_id: str = Field(
        min_length=1,
        max_length=80,
    )

    title: str = Field(
        min_length=1,
        max_length=120,
    )

    due_date: date

    category: str = Field(
        default="care",
        min_length=1,
        max_length=40,
    )


class WhatIfRequest(BaseModel):
    reading: NeonatalReading

    changes: dict[str, float] = Field(
        min_length=1,
        max_length=10,
    )


class FeedingLogRequest(BaseModel):
    infant_id: str = Field(min_length=1, max_length=80)
    log_date: date
    feeding_count: int = Field(ge=0, le=30)
    urine_output_count: int = Field(ge=0, le=100)
    stool_count: int = Field(ge=0, le=100)


class FeedingLogUpdateRequest(BaseModel):
    feeding_count: int = Field(ge=0, le=30)
    urine_output_count: int = Field(ge=0, le=100)
    stool_count: int = Field(ge=0, le=100)


# ============================================================
# AGE CALCULATION
# ============================================================


def calculate_age(
    date_of_birth: date,
) -> dict[str, Any]:

    today = date.today()

    if date_of_birth > today:
        raise ValueError(
            "Date of birth cannot be in the future."
        )

    total_days = (
        today - date_of_birth
    ).days

    years = (
        today.year
        - date_of_birth.year
    )

    months = (
        today.month
        - date_of_birth.month
    )

    days = (
        today.day
        - date_of_birth.day
    )

    if days < 0:

        months -= 1

        previous_month = (
            today.month - 1
        )

        previous_year = today.year

        if previous_month == 0:
            previous_month = 12
            previous_year -= 1

        days_in_previous_month = (
            date(
                previous_year,
                previous_month % 12 + 1,
                1,
            )
            - date(
                previous_year,
                previous_month,
                1,
            )
        ).days

        days += (
            days_in_previous_month
        )

    if months < 0:

        years -= 1
        months += 12

    parts: list[str] = []

    if years:
        parts.append(
            f"{years} year"
            if years == 1
            else f"{years} years"
        )

    if months:
        parts.append(
            f"{months} month"
            if months == 1
            else f"{months} months"
        )

    if days:
        parts.append(
            f"{days} day"
            if days == 1
            else f"{days} days"
        )

    age_display = (
        " ".join(parts)
        if parts
        else "0 days"
    )

    return {
        "age_days": total_days,
        "age_years": years,
        "age_months": months,
        "age_days_remainder": days,
        "age_display": age_display,
    }


# ============================================================
# STORAGE HELPERS
# ============================================================


def _read_records(
    path: Path,
    collection: str,
) -> list[dict[str, Any]]:

    return STORE.read(
        path,
        collection,
    )


def _write_records(
    path: Path,
    collection: str,
    records: list[dict[str, Any]],
) -> None:

    STORE.replace(
        path,
        collection,
        records,
    )


# ============================================================
# USER AUTHENTICATION HELPERS
# ============================================================


def _hash_password(
    password: str,
) -> str:

    return pwd_context.hash(
        password
    )


def _verify_password(
    password: str,
    password_hash: str,
) -> bool:

    try:

        return pwd_context.verify(
            password,
            password_hash,
        )

    except Exception:

        logger.exception(
            "Password verification failed"
        )

        return False


def _find_user(
    username: str,
) -> dict[str, Any] | None:

    users = _read_records(
        USERS_PATH,
        "user_accounts",
    )

    username_normalized = (
        username.strip().lower()
    )

    return next(
        (
            user
            for user in users
            if str(
                user.get(
                    "username",
                    "",
                )
            ).lower()
            == username_normalized
        ),
        None,
    )


def _find_baby(
    baby_id: str,
) -> dict[str, Any] | None:

    babies = _read_records(
        BABIES_PATH,
        "baby_profiles",
    )

    return next(
        (
            baby
            for baby in babies
            if baby.get(
                "baby_id"
            )
            == baby_id
        ),
        None,
    )


# ============================================================
# USER AUTHENTICATION
# ============================================================


@app.post(
    "/users/register",
    status_code=201,
)
def register_user(
    user: UserAccount,
) -> dict[str, Any]:

    username = user.username.strip()

    if not username:

        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty.",
        )

    existing_user = _find_user(
        username
    )

    if existing_user is not None:

        raise HTTPException(
            status_code=409,
            detail="Username already exists.",
        )

    baby = _find_baby(
        user.baby_id
    )

    if baby is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Baby profile not found. "
                "Create the baby profile before "
                "creating the linked user account."
            ),
        )

    allowed_roles = {
        "parent",
        "doctor",
        "nurse",
        "staff",
        "admin",
    }

    role = (
        user.role
        .strip()
        .lower()
    )

    if role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid role. Allowed roles: "
                "parent, doctor, nurse, staff, admin."
            ),
        )

    user_record = {

        "user_id": str(
            uuid4()
        ),

        "username": username,

        "password_hash": (
            _hash_password(
                user.password
            )
        ),

        "full_name": (
            user.full_name.strip()
        ),

        "role": role,

        "phone": (
            user.phone.strip()
        ),

        "email": (
            user.email
            .strip()
            .lower()
        ),

        "baby_id": user.baby_id,

        "created_at": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),

        "active": True,
    }

    STORE.append(
        USERS_PATH,
        "user_accounts",
        user_record,
    )

    return {

        "message": (
            "User account created successfully."
        ),

        "user": {

            "user_id": (
                user_record["user_id"]
            ),

            "username": (
                user_record["username"]
            ),

            "full_name": (
                user_record["full_name"]
            ),

            "role": (
                user_record["role"]
            ),

            "baby_id": (
                user_record["baby_id"]
            ),
        },
    }


@app.post(
    "/users/login",
)
def login_user(
    credentials: UserLogin,
) -> dict[str, Any]:

    user = _find_user(
        credentials.username
    )

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password.",
        )

    if not user.get(
        "active",
        True,
    ):

        raise HTTPException(
            status_code=403,
            detail="User account is inactive.",
        )

    password_hash = user.get(
        "password_hash"
    )

    if not password_hash:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password.",
        )

    if not _verify_password(
        credentials.password,
        password_hash,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password.",
        )

    return {

        "message": "Login successful.",

        "user": {

            "user_id": user.get(
                "user_id"
            ),

            "username": user.get(
                "username"
            ),

            "full_name": user.get(
                "full_name"
            ),

            "role": user.get(
                "role"
            ),

            "baby_id": user.get(
                "baby_id"
            ),

            "email": user.get(
                "email"
            ),
        },
    }


@app.get(
    "/users",
)
def get_users() -> dict[str, Any]:

    users = _read_records(
        USERS_PATH,
        "user_accounts",
    )

    safe_users = []

    for user in users:

        safe_users.append(
            {

                "user_id": user.get(
                    "user_id"
                ),

                "username": user.get(
                    "username"
                ),

                "full_name": user.get(
                    "full_name"
                ),

                "role": user.get(
                    "role"
                ),

                "phone": user.get(
                    "phone"
                ),

                "email": user.get(
                    "email"
                ),

                "baby_id": user.get(
                    "baby_id"
                ),

                "created_at": user.get(
                    "created_at"
                ),

                "active": user.get(
                    "active",
                    True,
                ),
            }
        )

    return {
        "count": len(
            safe_users
        ),
        "users": safe_users,
    }


# ============================================================
# BABY PROFILE
# ============================================================


@app.post(
    "/babies/profile",
    status_code=201,
)
def create_baby_profile(
    profile: BabyProfile,
) -> dict[str, Any]:

    try:

        age = calculate_age(
            profile.date_of_birth
        )

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    existing_babies = _read_records(
        BABIES_PATH,
        "baby_profiles",
    )

    if any(
        baby.get("baby_id")
        == profile.baby_id
        for baby in existing_babies
    ):

        raise HTTPException(
            status_code=409,
            detail="Baby ID already exists.",
        )

    baby = profile.model_dump(
        mode="json"
    )

    baby.update(
        {

            "created_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            ),

            "age": age,
        }
    )

    STORE.append(
        BABIES_PATH,
        "baby_profiles",
        baby,
    )

    return {

        "message": (
            "Baby profile created successfully"
        ),

        "baby": _json_safe(
            baby
        ),
    }


@app.get(
    "/babies",
)
def get_all_babies() -> dict[str, Any]:

    babies = _read_records(
        BABIES_PATH,
        "baby_profiles",
    )

    updated_babies = []

    for baby in babies:

        try:

            dob = date.fromisoformat(
                baby["date_of_birth"]
            )

            baby_copy = dict(
                baby
            )

            baby_copy["age"] = (
                calculate_age(
                    dob
                )
            )

            updated_babies.append(
                baby_copy
            )

        except (
            KeyError,
            ValueError,
        ):

            updated_babies.append(
                baby
            )

    return {

        "count": len(
            updated_babies
        ),

        "babies": _json_safe(
            updated_babies
        ),
    }


@app.get(
    "/babies/{baby_id}",
)
def get_baby_profile(
    baby_id: str,
) -> dict[str, Any]:

    babies = _read_records(
        BABIES_PATH,
        "baby_profiles",
    )

    baby = next(
        (
            item
            for item in babies
            if item.get(
                "baby_id"
            )
            == baby_id
        ),
        None,
    )

    if baby is None:

        raise HTTPException(
            status_code=404,
            detail="Baby profile not found.",
        )

    try:

        dob = date.fromisoformat(
            baby["date_of_birth"]
        )

        baby_copy = dict(
            baby
        )

        baby_copy["age"] = (
            calculate_age(
                dob
            )
        )

    except (
        KeyError,
        ValueError,
    ):

        baby_copy = baby

    return {
        "baby": _json_safe(
            baby_copy
        )
    }


# ============================================================
# RISK ASSESSMENT
# ============================================================


def _risk_level(
    reading: NeonatalReading,
) -> tuple[str, list[str]]:

    reasons: list[str] = []

    # Temperature
    if reading.temperature_c >= 38.0:

        reasons.append(
            "temperature is 38.0°C or higher"
        )

    elif reading.temperature_c < 35.5:

        reasons.append(
            "temperature is below 35.5°C"
        )

    elif (
        reading.temperature_c < 36.5
        or reading.temperature_c > 37.5
    ):

        reasons.append(
            "temperature is outside the newborn reference range"
        )

    # Respiratory rate
    if reading.respiratory_rate_bpm >= 60:

        reasons.append(
            "fast breathing detected"
        )

    # Heart rate
    if (
        reading.heart_rate_bpm < 100
        or reading.heart_rate_bpm > 160
    ):

        reasons.append(
            "heart rate is outside the newborn reference range"
        )

    # Oxygen saturation
    if reading.oxygen_saturation < 94:

        reasons.append(
            "oxygen saturation is low"
        )

    # Feeding
    if reading.feeding_frequency_per_day < 6:

        reasons.append(
            "reduced feeding frequency reported"
        )

    # Symptoms
    for symptom in reading.symptoms:

        reasons.append(
            f"reported symptom: {symptom}"
        )

    if reasons:

        return (
            "urgent review",
            reasons,
        )

    return (
        "routine monitoring",
        reasons,
    )


# ============================================================
# GROWTH ASSESSMENT
# ============================================================


def _growth_assessment(
    reading: NeonatalReading,
    baby: dict[str, Any],
    previous_readings: list[
        dict[str, Any]
    ],
) -> dict[str, Any]:

    current_weight = (
        reading.weight_kg
    )

    current_length = (
        reading.length_cm
    )

    current_head_circumference = (
        reading.head_circumference_cm
    )

    birth_weight = float(
        baby["birth_weight_kg"]
    )

    weight_change = (
        current_weight
        - birth_weight
    )

    weight_change_percent = (
        (
            weight_change
            / birth_weight
        )
        * 100
        if birth_weight > 0
        else 0
    )

    previous_weight = None

    if previous_readings:

        previous_weight = (
            previous_readings[0].get(
                "weight_kg"
            )
        )

    if previous_weight is not None:

        weight_change_from_last = (
            current_weight
            - float(
                previous_weight
            )
        )

    else:

        weight_change_from_last = (
            None
        )

    notes: list[str] = []

    if weight_change > 0:

        notes.append(
            "current weight is above recorded birth weight"
        )

    elif weight_change < 0:

        notes.append(
            "current weight is below recorded birth weight"
        )

    else:

        notes.append(
            "current weight is unchanged from birth weight"
        )

    if weight_change_from_last is not None:

        if weight_change_from_last > 0:

            notes.append(
                "weight increased compared with the previous reading"
            )

        elif weight_change_from_last < 0:

            notes.append(
                "weight decreased compared with the previous reading"
            )

        else:

            notes.append(
                "weight is unchanged from the previous reading"
            )

    age = calculate_age(
        date.fromisoformat(
            baby["date_of_birth"]
        )
    )

    return {

        "assessment": (
            "growth data recorded"
        ),

        "age_days": (
            age["age_days"]
        ),

        "age_display": (
            age["age_display"]
        ),

        "sex": baby["sex"],

        "gestational_age_weeks": (
            baby[
                "gestational_age_weeks"
            ]
        ),

        "birth_weight_kg": (
            birth_weight
        ),

        "current_weight_kg": (
            current_weight
        ),

        "weight_change_from_birth_kg": round(
            weight_change,
            3,
        ),

        "weight_change_from_birth_percent": round(
            weight_change_percent,
            2,
        ),

        "weight_change_from_previous_kg": (
            round(
                weight_change_from_last,
                3,
            )
            if weight_change_from_last
            is not None
            else None
        ),

        "current_length_cm": (
            current_length
        ),

        "current_head_circumference_cm": (
            current_head_circumference
        ),

        "notes": notes,

        "interpretation": (
            "Growth should be interpreted using "
            "age-, sex-, gestational-age-, and "
            "trajectory-aware reference standards. "
            "A single weight value is not classified "
            "as normal or abnormal by itself."
        ),

        "reference_source": (
            "WHO age- and sex-specific growth "
            "standards are intended for the "
            "reference layer."
        ),
    }


# ============================================================
# MACHINE LEARNING
# ============================================================


def _model_input(
    reading: NeonatalReading,
) -> pd.DataFrame:

    model_fields = {

        "gender",

        "gestational_age_weeks",

        "birth_weight_kg",

        "birth_length_cm",

        "birth_head_circumference_cm",

        "age_days",

        "weight_kg",

        "length_cm",

        "head_circumference_cm",

        "temperature_c",

        "heart_rate_bpm",

        "respiratory_rate_bpm",

        "oxygen_saturation",

        "feeding_type",

        "feeding_frequency_per_day",

        "urine_output_count",

        "stool_count",

        "jaundice_level_mg_dl",

        "apgar_score",

        "immunizations_done",

        "reflexes_normal",
    }

    return pd.DataFrame(
        [

            {
                key: value

                for key, value

                in reading.model_dump().items()

                if key in model_fields
            }

        ]
    )


def _model_prediction(
    reading: NeonatalReading,
) -> dict[str, Any] | None:

    if not MODEL_PATH.exists():

        return None

    return predict_input(
        _model_input(
            reading
        )
    )


def _model_explanation(
    reading: NeonatalReading,
) -> dict[str, Any] | None:

    if not MODEL_PATH.exists():

        return None

    return explain_prediction(
        _model_input(
            reading
        )
    )


# ============================================================
# HEALTH
# ============================================================


@app.get(
    "/health",
)
def health() -> dict[str, str]:

    return {

        "status": "ok",

        "model_status": (
            "ready"
            if MODEL_PATH.exists()
            else "not trained"
        ),

        "storage_backend": (
            STORE.backend
        ),
    }


# ============================================================
# XAI
# ============================================================


@app.get(
    "/xai/global",
)
def global_explanation() -> dict[str, Any]:

    return explain_trend()


@app.post(
    "/xai/what-if",
)
def what_if_explanation(
    request: WhatIfRequest,
) -> dict[str, Any]:

    return explain_what_if(
        _model_input(
            request.reading
        ),
        request.changes,
    )


# ============================================================
# MONITORING
# ============================================================


@app.post(
    "/monitoring/readings",
    status_code=201,
)
def record_reading(
    reading: NeonatalReading,
) -> dict[str, Any]:

    # --------------------------------------------------------
    # 1. Find the registered baby profile
    # --------------------------------------------------------

    baby = _find_baby(
        reading.infant_id
    )

    if baby is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "No baby profile found for "
                f"baby ID: {reading.infant_id}"
            ),
        )

    # --------------------------------------------------------
    # 2. Calculate age automatically from Baby Profile
    # --------------------------------------------------------

    try:

        baby_age = calculate_age(
            date.fromisoformat(
                baby["date_of_birth"]
            )
        )

    except (
        KeyError,
        ValueError,
    ) as error:

        raise HTTPException(
            status_code=400,
            detail=(
                "Baby profile contains an invalid "
                f"date of birth: {error}"
            ),
        )

    # --------------------------------------------------------
    # 3. Baby Profile is the source of truth
    # --------------------------------------------------------

    assessment_reading = (
        reading.model_copy(
            update={

                "gender": baby["sex"],

                "gestational_age_weeks": (
                    baby[
                        "gestational_age_weeks"
                    ]
                ),

                "birth_weight_kg": (
                    baby[
                        "birth_weight_kg"
                    ]
                ),

                "birth_length_cm": (
                    baby[
                        "birth_length_cm"
                    ]
                ),

                "birth_head_circumference_cm": (
                    baby[
                        "birth_head_circumference_cm"
                    ]
                ),

                "age_days": (
                    baby_age[
                        "age_days"
                    ]
                ),
            }
        )
    )

    # --------------------------------------------------------
    # 4. Get previous history for this baby
    # --------------------------------------------------------

    previous_readings = [

        record

        for record in _read_records(
            STORE_PATH,
            "monitoring_readings",
        )

        if record.get(
            "infant_id"
        )
        == reading.infant_id
    ]

    previous_readings.sort(
        key=lambda record: record.get(
            "recorded_at",
            "",
        ),
        reverse=True,
    )

    # --------------------------------------------------------
    # 5. Risk assessment
    # --------------------------------------------------------

    risk, reasons = _risk_level(
        assessment_reading
    )

    # --------------------------------------------------------
    # 6. Growth assessment
    # --------------------------------------------------------

    growth_assessment = (
        _growth_assessment(
            assessment_reading,
            baby,
            previous_readings,
        )
    )

    # --------------------------------------------------------
    # 7. Create stored record
    # --------------------------------------------------------

    record = (
        assessment_reading.model_dump(
            mode="json"
        )
    )

    # --------------------------------------------------------
    # 8. Machine learning prediction
    # --------------------------------------------------------

    try:

        model_result = (
            _model_prediction(
                assessment_reading
            )
        )

        prediction_error = None

    except Exception as error:

        model_result = None

        prediction_error = str(
            error
        )

        logger.exception(
            "Monitoring prediction failed"
        )

    # --------------------------------------------------------
    # 9. SHAP explanation
    # --------------------------------------------------------

    explanation = None
    explanation_error = None

    if model_result:

        try:

            explanation = (
                _model_explanation(
                    assessment_reading
                )
            )

        except Exception as error:

            explanation_error = str(
                error
            )

            logger.exception(
                "Monitoring SHAP explanation failed"
            )

    if model_result:

        model_result[
            "explanation"
        ] = explanation

    # --------------------------------------------------------
    # 10. Add Baby Profile + Growth + Risk information
    # --------------------------------------------------------

    record.update(
        {

            "baby_profile": {

                "baby_id": (
                    baby["baby_id"]
                ),

                "baby_name": (
                    baby["baby_name"]
                ),

                "sex": (
                    baby["sex"]
                ),

                "date_of_birth": (
                    baby["date_of_birth"]
                ),

                "gestational_age_weeks": (
                    baby[
                        "gestational_age_weeks"
                    ]
                ),

                "birth_weight_kg": (
                    baby[
                        "birth_weight_kg"
                    ]
                ),

                "birth_length_cm": (
                    baby[
                        "birth_length_cm"
                    ]
                ),

                "birth_head_circumference_cm": (
                    baby[
                        "birth_head_circumference_cm"
                    ]
                ),

                "age": baby_age,
            },

            "growth_assessment": (
                growth_assessment
            ),

            "id": str(
                uuid4()
            ),

            "risk_level": risk,

            "risk_reasons": reasons,

            "risk_basis": (
                "context-aware newborn "
                "reference rules, reported "
                "symptoms, Baby Profile context, "
                "and growth trajectory data"
            ),

            "model": model_result,

            "explanation_status": (
                "generated"
                if explanation
                else "failed"
            ),

            "prediction_status": (
                "generated"
                if model_result
                else "failed"
            ),

            "prediction_error": (
                prediction_error
            ),

            "explanation_error": (
                explanation_error
            ),
        }
    )

    # --------------------------------------------------------
    # 11. Store record
    # --------------------------------------------------------

    STORE.append(
        STORE_PATH,
        "monitoring_readings",
        record,
    )

    # --------------------------------------------------------
    # 12. Response
    # --------------------------------------------------------

    return {

        "record": _json_safe(
            record
        ),

        "action": (

            "seek urgent clinical assessment"

            if risk == "urgent review"

            else "continue scheduled monitoring"
        ),

        "warning": (
            "Prototype demonstration alert. "
            "This is research decision support "
            "and does not provide a diagnosis. "
            "Seek qualified clinical assessment "
            "for any concern."
        ),
    }

@app.post(
    "/monitoring/quick-readings"
)
def record_quick_reading(
    reading: QuickReadingPayload,
) -> dict[str, Any]:

    baby = _find_baby(
        reading.infant_id
    )

    if baby is None:
        raise HTTPException(
            status_code=404,
            detail=(
                "No baby profile found for "
                f"baby ID: {reading.infant_id}"
            ),
        )

    try:
        baby_age = calculate_age(
            date.fromisoformat(
                baby["date_of_birth"]
            )
        )
    except (
        KeyError,
        ValueError,
    ) as error:
        raise HTTPException(
            status_code=400,
            detail=(
                "Baby profile contains an invalid "
                f"date of birth: {error}"
            ),
        )

    full_reading = NeonatalReading(
        infant_id=baby["baby_id"],
        simulated=reading.simulated,
        recorded_at=reading.recorded_at,

        gender=baby["sex"],
        gestational_age_weeks=float(
            baby["gestational_age_weeks"]
        ),
        birth_weight_kg=float(
            baby["birth_weight_kg"]
        ),
        birth_length_cm=float(
            baby["birth_length_cm"]
        ),
        birth_head_circumference_cm=float(
            baby["birth_head_circumference_cm"]
        ),

        age_days=int(
            baby_age["age_days"]
        ),

        length_cm=reading.length_cm,
        head_circumference_cm=(
            reading.head_circumference_cm
        ),
        temperature_c=reading.temperature_c,
        heart_rate_bpm=reading.heart_rate_bpm,
        respiratory_rate_bpm=(
            reading.respiratory_rate_bpm
        ),
        oxygen_saturation=(
            reading.oxygen_saturation
        ),
        weight_kg=reading.weight_kg,

        feeding_type=baby["feeding_type"],
        feeding_frequency_per_day=(
            reading.feeding_frequency_per_day
        ),
        urine_output_count=(
            reading.urine_output_count
        ),
        stool_count=(
            reading.stool_count
        ),
        jaundice_level_mg_dl=(
            reading.jaundice_level_mg_dl
        ),

        apgar_score=9,
        immunizations_done=(
            reading.immunizations_done
        ),
        reflexes_normal=(
            reading.reflexes_normal
        ),
        sleeping_hours=reading.sleeping_hours,

        vaccination_status=(
            "Recorded in baby profile"
        ),

        symptoms=reading.symptoms,
    )

    return record_reading(
        full_reading
    )

@app.get(
    "/monitoring/{infant_id}"
)
def monitoring_history(
    infant_id: str,
) -> dict[str, Any]:

    readings = [

        record

        for record in _read_records(
            STORE_PATH,
            "monitoring_readings",
        )

        if record.get(
            "infant_id"
        )
        == infant_id
    ]

    readings.sort(
        key=lambda record: record.get(
            "recorded_at",
            "",
        ),
        reverse=True,
    )

    return {

        "infant_id": infant_id,

        "count": len(
            readings
        ),

        "readings": readings,
    }


# ============================================================
# CARE REMINDERS
# ============================================================


@app.post(
    "/care/reminders",
    status_code=201,
)
def create_reminder(
    request: ReminderRequest,
) -> dict[str, Any]:

    reminder = request.model_dump(
        mode="json"
    )

    reminder.update(
        {

            "id": str(
                uuid4()
            ),

            "created_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            ),
        }
    )

    STORE.append(
        REMINDERS_PATH,
        "care_reminders",
        reminder,
    )

    return reminder


# ============================================================
# CARE GUIDANCE
# ============================================================


@app.get(
    "/care/{infant_id}"
)
def care_guidance(
    infant_id: str,
) -> dict[str, Any]:

    readings = [

        record

        for record in _read_records(
            STORE_PATH,
            "monitoring_readings",
        )

        if record.get(
            "infant_id"
        )
        == infant_id
    ]

    latest = (

        max(
            readings,
            key=lambda record: record.get(
                "recorded_at",
                "",
            ),
        )

        if readings

        else None
    )

    guidance = [

        (
            "Keep feeding, sleep, temperature, "
            "and vaccination records up to date."
        ),

        (
            "Discuss any persistent change "
            "with the baby's clinician."
        ),
    ]

    if (
        latest
        and latest.get(
            "risk_level"
        )
        == "urgent review"
    ):

        guidance.insert(
            0,
            (
                "Seek urgent clinical assessment "
                "based on the latest recorded "
                "warning signs."
            ),
        )

    return {

        "infant_id": infant_id,

        "latest_reading": latest,

        "guidance": guidance,

        "reminder_window_days": 7,
    }


@app.post("/feeding-logs", status_code=201)
def create_feeding_log(request: FeedingLogRequest) -> dict[str, Any]:
    if _find_baby(request.infant_id) is None:
        raise HTTPException(status_code=404, detail="Baby profile not found.")
    logs = _read_records(FEEDING_LOGS_PATH, "feeding_logs")
    if any(
        log.get("infant_id") == request.infant_id
        and log.get("log_date") == request.log_date.isoformat()
        for log in logs
    ):
        raise HTTPException(
            status_code=409,
            detail="A feeding log already exists for this baby and date. Use the update endpoint.",
        )
    log = request.model_dump(mode="json")
    log.update({"id": str(uuid4()), "created_at": datetime.now(timezone.utc).isoformat()})
    STORE.append(FEEDING_LOGS_PATH, "feeding_logs", log)
    return log


@app.get("/feeding-logs/{infant_id}")
def list_feeding_logs(infant_id: str) -> list[dict[str, Any]]:
    if _find_baby(infant_id) is None:
        raise HTTPException(status_code=404, detail="Baby profile not found.")
    logs = [
        log
        for log in _read_records(FEEDING_LOGS_PATH, "feeding_logs")
        if log.get("infant_id") == infant_id
    ]
    logs.sort(key=lambda log: log["log_date"], reverse=True)
    return logs


@app.put("/feeding-logs/{infant_id}/{log_date}")
def update_feeding_log(
    infant_id: str,
    log_date: date,
    request: FeedingLogUpdateRequest,
) -> dict[str, Any]:
    if _find_baby(infant_id) is None:
        raise HTTPException(status_code=404, detail="Baby profile not found.")
    logs = _read_records(FEEDING_LOGS_PATH, "feeding_logs")
    existing = next(
        (
            log
            for log in logs
            if log.get("infant_id") == infant_id
            and log.get("log_date") == log_date.isoformat()
        ),
        None,
    )
    if existing is None:
        raise HTTPException(status_code=404, detail="Feeding log not found.")
    updated = {**existing, **request.model_dump()}
    if not STORE.update_one(
        FEEDING_LOGS_PATH,
        "feeding_logs",
        "id",
        existing["id"],
        updated,
    ):
        raise HTTPException(status_code=500, detail="Unable to update the feeding log.")
    return updated