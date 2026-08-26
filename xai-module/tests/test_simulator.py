import unittest

from monitoring.simulator import generate_reading, run_simulator


class SimulatorTests(unittest.TestCase):
    def test_generated_reading_is_valid_and_simulated(self):
        reading = generate_reading(0)
        self.assertTrue(reading.simulated)
        self.assertEqual(reading.oxygen_saturation, 98)

    def test_finite_run_stops(self):
        sent = []
        count = run_simulator(5, 0, sent.append, stop_requested=lambda: len(sent) == 2)
        self.assertEqual(count, 2)
        self.assertEqual(len(sent), 2)

    def test_network_error_can_be_reported_without_stopping(self):
        errors = []
        count = run_simulator(2, 0, lambda reading: (_ for _ in ()).throw(RuntimeError("offline")), on_error=errors.append)
        self.assertEqual(count, 0)
        self.assertEqual(len(errors), 2)


if __name__ == "__main__":
    unittest.main()