"""Evaluate the saved model on its held-out test data."""
from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    make_scorer,
    precision_score,
    recall_score,
    roc_auc_score,
)

from preprocessing.preprocess import TARGET, prepare_dataset
from models.train_model import MODEL_PATH, SPLIT_PATH, build_pipeline

PROJECT_ROOT = Path(__file__).resolve().parents[1]
METRICS_PATH = PROJECT_ROOT / "evaluation" / "metrics.json"


def _dataset_review(data: pd.DataFrame, target: pd.Series) -> dict:
    feature_columns = list(data.columns)
    train_x, test_x, train_y, test_y = train_test_split(
        data, target, test_size=0.2, random_state=42, stratify=target
    )
    diagnostic_model = build_pipeline(data)
    diagnostic_model.set_params(classifier=DecisionTreeClassifier(max_depth=3, random_state=42))
    diagnostic_model.fit(train_x, train_y)
    shallow_tree_accuracy = diagnostic_model.score(test_x, test_y)
    findings = [
        "No exact duplicate feature rows were found in the prepared dataset."
        if not data.duplicated().any()
        else "Exact duplicate feature rows exist and require grouped-split review.",
        "No feature name directly references the risk_level target."
        if not any(TARGET in column.lower() for column in feature_columns)
        else "A feature name directly references the risk_level target.",
        "A depth-3 diagnostic tree reached perfect holdout accuracy; synthetic or deterministic label generation requires review."
        if shallow_tree_accuracy >= 0.999
        else "A shallow diagnostic tree did not reach perfect holdout accuracy.",
    ]
    return {
        "exact_duplicate_feature_rows": int(data.duplicated().sum()),
        "feature_columns_matching_target_name": [
            column for column in feature_columns if TARGET in column.lower()
        ],
        "infant_grouping_available": any(
            column.lower() in {"infant_id", "baby_id", "id"} for column in feature_columns
        ),
        "shallow_tree_depth": 3,
        "shallow_tree_holdout_accuracy": shallow_tree_accuracy,
        "findings": findings,
    }


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
    prepared_data, prepared_target, _ = prepare_dataset()
    cv = cross_validate(
        build_pipeline(prepared_data),
        prepared_data,
        prepared_target,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring={
            "accuracy": "accuracy",
            "balanced_accuracy": "balanced_accuracy",
            "roc_auc": "roc_auc",
            "precision": make_scorer(precision_score, pos_label="at risk", zero_division=0),
            "recall": make_scorer(recall_score, pos_label="at risk", zero_division=0),
            "f1": make_scorer(f1_score, pos_label="at risk", zero_division=0),
        },
        n_jobs=1,
    )
    metrics = {
        "rows_evaluated": len(test_y),
        "accuracy": accuracy_score(test_y, predictions),
        "balanced_accuracy": balanced_accuracy_score(test_y, predictions),
        "roc_auc": roc_auc_score(test_y == "at risk", probabilities[:, at_risk_index]),
        "confusion_matrix": confusion_matrix(test_y, predictions, labels=classes).tolist(),
        "class_order": classes,
        "classification_report": report,
        "cross_validation": {
            metric: {
                "mean": float(cv[f"test_{metric}"].mean()),
                "std": float(cv[f"test_{metric}"].std()),
            }
            for metric in ("accuracy", "balanced_accuracy", "roc_auc", "precision", "recall", "f1")
        },
        "dataset_review": _dataset_review(prepared_data, prepared_target),
        "validation_flags": validation_flags,
        "warning": "These metrics describe this dataset split only; they do not establish clinical accuracy.",
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    print(json.dumps(evaluate_model(), indent=2))