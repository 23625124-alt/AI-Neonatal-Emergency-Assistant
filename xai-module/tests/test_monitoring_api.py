import unittest
from unittest.mock import patch

import pandas as pd

from pydantic import ValidationError

from api.main import NeonatalReading, WhatIfRequest, _model_explanation, _model_prediction, _risk_level, global_explanation, record_reading, what_if_explanation
from explainability.explain import explain_prediction


def reading(**updates) -> NeonatalReading:
    values = {
        "infant_id": "test-infant",
        "gender": "Female",
        "gestational_age_weeks": 40.2,
        "birth_weight_kg": 3.3,
        "birth_length_cm": 50.0,
        "birth_head_circumference_cm": 31.9,
        "age_days": 2,
        "length_cm": 50.2,
        "head_circumference_cm": 32.0,
        "temperature_c": 37.0,
        "heart_rate_bpm": 150,
        "respiratory_rate_bpm": 40,
        "oxygen_saturation": 98,
        "weight_kg": 3.2,
        "feeding_type": "Formula",
        "feeding_frequency_per_day": 8,
        "urine_output_count": 6,
        "stool_count": 2,
        "jaundice_level_mg_dl": 4.2,
        "apgar_score": 8.0,
        "immunizations_done": 1,
        "reflexes_normal": 1,
        "sleeping_hours": 14,
        "vaccination_status": "recorded",
        "symptoms": [],
    }
    values.update(updates)
    return NeonatalReading(**values)


class MonitoringApiTests(unittest.TestCase):
    def test_valid_reading_reaches_saved_model(self):
        self.assertEqual(_risk_level(reading()), ("routine monitoring", []))
        self.assertIsNotNone(_model_prediction(reading()))
        self.assertIsNotNone(_model_explanation(reading()))

    def test_demonstration_rule_marks_review(self):
        risk, reasons = _risk_level(reading(temperature_c=35.5))
        self.assertEqual(risk, "urgent review")
        self.assertIn("temperature outside the configured newborn review range", reasons)

    def test_invalid_oxygen_saturation_is_rejected(self):
        with self.assertRaises(ValidationError):
            reading(oxygen_saturation=101)

    def test_missing_model_feature_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "Missing model features"):
            explain_prediction(pd.DataFrame([{"temperature_c": 37.0}]))

    def test_monitoring_response_contains_prediction_and_explanation(self):
        response = record_reading(reading())
        self.assertIn("record", response)
        self.assertEqual(response["record"]["explanation_status"], "generated")
        self.assertIn("top_contributions", response["record"]["model"]["explanation"])

    def test_shap_failure_preserves_prediction(self):
        with patch("api.main._model_explanation", side_effect=RuntimeError("SHAP unavailable")):
            response = record_reading(reading())
        self.assertEqual(response["record"]["prediction_status"], "generated")
        self.assertEqual(response["record"]["explanation_status"], "failed")
        self.assertEqual(response["record"]["explanation_error"], "SHAP unavailable")

    def test_multiple_readings_are_independent(self):
        first = record_reading(reading(infant_id="one"))
        second = record_reading(reading(infant_id="two", simulated=True))
        self.assertNotEqual(first["record"]["id"], second["record"]["id"])
        self.assertTrue(second["record"]["simulated"])

    def test_global_explanation_returns_importance(self):
        result = global_explanation()
        self.assertGreater(result["rows_explained"], 0)
        self.assertTrue(result["global_feature_importance"])

    def test_what_if_returns_prediction_and_changes(self):
        result = what_if_explanation(WhatIfRequest(reading=reading(), changes={"temperature_c": 35.5}))
        self.assertIn("prediction", result)
        self.assertEqual(result["what_if_changes"], {"temperature_c": 35.5})
        self.assertTrue(result["top_contributions"])


if __name__ == "__main__":
    unittest.main()