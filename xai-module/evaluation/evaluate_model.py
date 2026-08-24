"""Evaluate the saved model on its held-out test data."""
from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)

from preprocessing.preprocess import TARGET
from models.train_model import MODEL_PATH, SPLIT_PATH

PROJECT_ROOT = Path(__file__).resolve().parents[1]
METRICS_PATH = PROJECT_ROOT / "evaluation" / "metrics.json"


def evaluate_model() -> dict:
    model = joblib.load(MODEL_PATH)
    test_data = pd.read_csv(SPLIT_PATH)
    test_x = test_data.drop(columns=[TARGET])
    test_y = test_data[TARGET]
    predictions = model.predict(test_x)
    probabilities = model.predict_proba(test_x)
    classes = list(model.classes_)
    at_risk_index = classes.index("at risk") if "at risk" in classes else 1

    report = classification_report(test_y, predictions, output_dict=True, zero_division=0)
    validation_flags = []
    if (
        accuracy_score(test_y, predictions) >= 0.999
        and balanced_accuracy_score(test_y, predictions) >= 0.999
        and roc_auc_score(test_y == "at risk", probabilities[:, at_risk_index]) >= 0.999
    ):
        validation_flags.append(
            "Perfect or near-perfect holdout metrics require target-leakage and synthetic-label review before clinical interpretation."
        )
    metrics = {
        "rows_evaluated": len(test_y),
        "accuracy": accuracy_score(test_y, predictions),
        "balanced_accuracy": balanced_accuracy_score(test_y, predictions),
        "roc_auc": roc_auc_score(test_y == "at risk", probabilities[:, at_risk_index]),
        "confusion_matrix": confusion_matrix(test_y, predictions, labels=classes).tolist(),
        "class_order": classes,
        "classification_report": report,
        "validation_flags": validation_flags,
        "warning": "These metrics describe this dataset split only; they do not establish clinical accuracy.",
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    print(json.dumps(evaluate_model(), indent=2))