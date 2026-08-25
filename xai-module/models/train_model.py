"""Train and save a baseline neonatal risk research model."""
from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from preprocessing.preprocess import OUTPUT, TARGET, prepare_dataset

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = PROJECT_ROOT / "models" / "neonatal_risk_model.joblib"
SPLIT_PATH = PROJECT_ROOT / "models" / "test_data.csv"
META_PATH = PROJECT_ROOT / "models" / "model_metadata.json"


def train_model() -> dict:
    data, target, _ = prepare_dataset()
    categorical = data.select_dtypes(include=["object", "category"]).columns.tolist()
    numerical = [column for column in data.columns if column not in categorical]

    transformer = ColumnTransformer(
        transformers=[
            ("numeric", "passthrough", numerical),
            ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical),
        ]
    )
    pipeline = Pipeline(
        steps=[
            ("preprocessor", transformer),
            ("classifier", RandomForestClassifier(
                n_estimators=300,
                random_state=42,
                class_weight="balanced",
                n_jobs=-1,
            )),
        ]
    )

    train_x, test_x, train_y, test_y = train_test_split(
        data, target, test_size=0.2, random_state=42, stratify=target
    )
    pipeline.fit(train_x, train_y)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_PATH)
    test_data = test_x.copy()
    test_data[TARGET] = test_y.to_numpy()
    test_data.to_csv(SPLIT_PATH, index=False)
    metadata = {
        "source": OUTPUT.relative_to(PROJECT_ROOT).as_posix(),
        "target": TARGET,
        "feature_columns": data.columns.tolist(),
        "categorical_columns": categorical,
        "numerical_columns": numerical,
        "random_state": 42,
        "test_size": 0.2,
        "training_rows": len(train_x),
        "test_rows": len(test_x),
        "model": "RandomForestClassifier",
        "research_warning": "This model is not clinically validated and must not be used for diagnosis.",
    }
    META_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


if __name__ == "__main__":
    print(json.dumps(train_model(), indent=2))