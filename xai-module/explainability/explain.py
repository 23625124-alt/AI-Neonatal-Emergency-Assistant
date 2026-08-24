"""Generate SHAP explanations for individual, trend, and what-if views."""
from pathlib import Path
import argparse
import json

import joblib
import matplotlib.pyplot as plt
import pandas as pd
import shap

from models.train_model import MODEL_PATH, SPLIT_PATH
from preprocessing.preprocess import TARGET

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "explainability" / "outputs"


def transformed_feature_names(model) -> list[str]:
    transformer = model.named_steps["preprocessor"]
    return transformer.get_feature_names_out().tolist()


def explain_row(row_index: int, what_if: dict[str, float] | None = None) -> dict:
    model = joblib.load(MODEL_PATH)
    test_data = pd.read_csv(SPLIT_PATH)
    features = test_data.drop(columns=[TARGET])
    if row_index < 0 or row_index >= len(features):
        raise IndexError(f"row-index must be between 0 and {len(features) - 1}")
    row = features.iloc[[row_index]].copy()
    if what_if:
        for column, value in what_if.items():
            if column not in row.columns:
                raise ValueError(f"Unknown feature: {column}")
            row.loc[:, column] = value

    transformed = model.named_steps["preprocessor"].transform(row)
    classifier = model.named_steps["classifier"]
    explainer = shap.TreeExplainer(classifier)
    shap_values = explainer.shap_values(transformed)
    class_index = list(classifier.classes_).index("at risk")
    values = shap_values[class_index][0] if isinstance(shap_values, list) else shap_values[0, :, class_index]
    names = transformed_feature_names(model)
    contributions = sorted(
        ({"feature": name, "shap_value": float(value)} for name, value in zip(names, values)),
        key=lambda item: abs(item["shap_value"]),
        reverse=True,
    )
    result = {
        "row_index": row_index,
        "prediction": model.predict(row)[0],
        "probability_at_risk": float(model.predict_proba(row)[0, class_index]),
        "what_if_changes": what_if or {},
        "top_contributions": contributions[:15],
        "warning": "SHAP values describe model associations, not causes or clinical advice.",
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = "_what_if" if what_if else ""
    (OUTPUT_DIR / f"individual_{row_index}{suffix}.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result


def explain_trend() -> dict:
    model = joblib.load(MODEL_PATH)
    test_data = pd.read_csv(SPLIT_PATH)
    features = test_data.drop(columns=[TARGET])
    transformed = model.named_steps["preprocessor"].transform(features)
    classifier = model.named_steps["classifier"]
    values = shap.TreeExplainer(classifier).shap_values(transformed)
    class_index = list(classifier.classes_).index("at risk")
    matrix = values[class_index] if isinstance(values, list) else values[:, :, class_index]
    names = transformed_feature_names(model)
    mean_abs = sorted(
        ({"feature": name, "mean_absolute_shap": float(abs(matrix[:, index]).mean())} for index, name in enumerate(names)),
        key=lambda item: item["mean_absolute_shap"],
        reverse=True,
    )
    result = {
        "rows_explained": len(features),
        "global_feature_importance": mean_abs[:20],
        "warning": "This trend summarizes model behavior on the held-out sample; it is not clinical importance.",
    }
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "trend_summary.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--row-index", type=int)
    parser.add_argument("--trend", action="store_true")
    parser.add_argument("--what-if", nargs="*", default=[])
    args = parser.parse_args()
    if args.trend:
        print(json.dumps(explain_trend(), indent=2))
    elif args.row_index is not None:
        changes = {item.split("=", 1)[0]: float(item.split("=", 1)[1]) for item in args.what_if}
        print(json.dumps(explain_row(args.row_index, changes or None), indent=2))
    else:
        parser.error("choose --trend or --row-index")


if __name__ == "__main__":
    main()