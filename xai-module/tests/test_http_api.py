import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from api import main
from api.storage import DataStore


def profile_payload(infant_id: str = "http-infant") -> dict[str, object]:
    return {
        "infant_id": infant_id,
        "password": "safe-password",
        "gender": "Female",
        "gestational_age_weeks": 39,
        "birth_weight_kg": 3.2,
        "birth_length_cm": 50,
        "birth_head_circumference_cm": 34,
        "feeding_type": "Formula",
        "apgar_score": 9,
        "vaccination_status": "recorded",
    }


class HttpApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        root = Path(self.temp_dir.name)
        paths = {
            "STORE": DataStore(root),
            "STORE_PATH": root / "monitoring.json",
            "REMINDERS_PATH": root / "reminders.json",
            "BABY_PROFILES_PATH": root / "profiles.json",
            "FEEDING_LOGS_PATH": root / "feeding-logs.json",
        }
        self.patches = patch.multiple(main, **paths)
        self.patches.start()
        self.client = TestClient(main.app)

    def tearDown(self):
        self.patches.stop()
        self.temp_dir.cleanup()

    def test_health_reports_ready_local_storage(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["storage_backend"], "json")

    def test_register_login_and_invalid_login(self):
        created = self.client.post("/babies/register", json=profile_payload())
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.json(), {"infant_id": "http-infant", "status": "created"})

        logged_in = self.client.post(
            "/babies/login",
            json={"infant_id": "http-infant", "password": "safe-password"},
        )
        self.assertEqual(logged_in.status_code, 200)
        self.assertTrue(logged_in.json()["authenticated"])

        rejected = self.client.post(
            "/babies/login",
            json={"infant_id": "http-infant", "password": "wrong-password"},
        )
        self.assertEqual(rejected.status_code, 401)

    def test_reminder_round_trip(self):
        self.client.post("/babies/register", json=profile_payload("http-infant"))
        created = self.client.post(
            "/care/reminders",
            json={
                "infant_id": "http-infant",
                "title": "Feeding",
                "due_date": "2026-10-09",
                "category": "feeding",
            },
        )
        self.assertEqual(created.status_code, 201)

        reminders = self.client.get("/care/http-infant/reminders")
        self.assertEqual(reminders.status_code, 200)
        self.assertEqual(reminders.json()[0]["title"], "Feeding")

    def test_reminders_reject_unknown_baby(self):
        response = self.client.post(
            "/care/reminders",
            json={
                "infant_id": "not-registered",
                "title": "Feeding",
                "due_date": "2026-10-09",
                "category": "feeding",
            },
        )
        self.assertEqual(response.status_code, 404)

    def test_invalid_monitoring_payload_returns_validation_error(self):
        response = self.client.post(
            "/monitoring/readings",
            json={"infant_id": "http-infant", "oxygen_saturation": 101},
        )
        self.assertEqual(response.status_code, 422)

    def test_registered_baby_can_create_and_list_daily_feeding_log(self):
        created = self.client.post("/babies/register", json=profile_payload("registered-baby"))
        self.assertEqual(created.status_code, 201)
        profile = self.client.get("/babies/registered-baby")
        self.assertEqual(profile.status_code, 200)
        self.assertNotIn("password_hash", profile.json())

        log = self.client.post(
            "/feeding-logs",
            json={
                "infant_id": "registered-baby",
                "log_date": "2026-10-09",
                "feeding_count": 8,
                "urine_output_count": 6,
                "stool_count": 2,
            },
        )
        self.assertEqual(log.status_code, 201)
        self.assertEqual(log.json()["infant_id"], "registered-baby")

        logs = self.client.get("/feeding-logs/registered-baby")
        self.assertEqual(logs.status_code, 200)
        self.assertEqual(len(logs.json()), 1)
        self.assertEqual(logs.json()[0]["log_date"], "2026-10-09")

    def test_feeding_log_rejects_unknown_baby_and_duplicate_date(self):
        unknown = self.client.post(
            "/feeding-logs",
            json={
                "infant_id": "not-registered",
                "log_date": "2026-10-09",
                "feeding_count": 1,
                "urine_output_count": 1,
                "stool_count": 0,
            },
        )
        self.assertEqual(unknown.status_code, 404)

        self.client.post("/babies/register", json=profile_payload("duplicate-baby"))
        payload = {
            "infant_id": "duplicate-baby",
            "log_date": "2026-10-09",
            "feeding_count": 8,
            "urine_output_count": 6,
            "stool_count": 2,
        }
        self.assertEqual(self.client.post("/feeding-logs", json=payload).status_code, 201)
        self.assertEqual(self.client.post("/feeding-logs", json=payload).status_code, 409)

    def test_feeding_log_can_be_updated_explicitly(self):
        self.client.post("/babies/register", json=profile_payload("editable-baby"))
        payload = {
            "infant_id": "editable-baby",
            "log_date": "2026-10-09",
            "feeding_count": 4,
            "urine_output_count": 3,
            "stool_count": 1,
        }
        self.client.post("/feeding-logs", json=payload)
        updated = self.client.put(
            "/feeding-logs/editable-baby/2026-10-09",
            json={"feeding_count": 7, "urine_output_count": 5, "stool_count": 2},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["feeding_count"], 7)


if __name__ == "__main__":
    unittest.main()
