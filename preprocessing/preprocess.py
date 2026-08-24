"""Validate and prepare the neonatal research dataset."""
from pathlib import Path
import json
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT_ROOT / "data" / "raw" / "neonatal_model_candidate.csv"
OUTPUT = PROJECT_ROOT / "data" / "processed" / "neonatal_prepared.csv"
AUDIT = PROJECT_ROOT / "data" / "processed" / "data_quality_report.json"
TARGET = "risk_level"
REMOVED_COLUMNS = {"record_month", "record_day_of_week", "name", "baby_id", "id", "record_id"}


def prepare_dataset(source: Path = SOURCE) -> tuple[pd.DataFrame, pd.Series, dict]:
    data = pd.read_csv(source)
    if TARGET not in data.columns:
        raise ValueError(f"Required target column '{TARGET}' was not found.")

    removed = sorted((set(data.columns) & REMOVED_COLUMNS) - {TARGET})
    prepared = data.drop(columns=removed)
    missing = prepared.isna().sum().astype(int).to_dict()
    invalid_binary = {
        column: sorted(set(prepared[column].dropna().unique()) - {0, 1})
        for column in ("immunizations_done", "reflexes_normal")
        if column in prepared
    }
    suspicious = {}
    if "oxygen_saturation" in prepared:
        values = prepared["oxygen_saturation"]
        suspicious["oxygen_saturation_above_100"] = int((values > 100).sum())
    if "gestational_age_weeks" in prepared:
        suspicious["gestational_age_above_42"] = int((prepared["gestational_age_weeks"] > 42).sum())

    report = {
        "rows": int(len(prepared)),
        "columns": list(prepared.columns),
        "target": TARGET,
        "removed_columns": removed,
        "missing_values": missing,
        "invalid_binary_values": invalid_binary,
        "suspicious_values_for_review": suspicious,
        "target_values": prepared[TARGET].value_counts().to_dict(),
        "limitations": [
            "Suspicious values are reported, not changed using invented clinical thresholds.",
            "Target-generation and collection procedures must be verified by the research team.",
        ],
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    prepared.to_csv(OUTPUT, index=False)
    AUDIT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return prepared.drop(columns=[TARGET]), prepared[TARGET], report


if __name__ == "__main__":
    _, _, result = prepare_dataset()
    print(json.dumps(result, indent=2))
