"""Finite software-only sensor simulator for development demonstrations."""
from __future__ import annotations

from datetime import datetime, timezone
import json
import time
from typing import Callable
from urllib.request import Request, urlopen

from api.main import NeonatalReading


def generate_reading(index: int, infant_id: str = "simulated-infant") -> NeonatalReading:
    return NeonatalReading(
        infant_id=infant_id,
        simulated=True,
        recorded_at=datetime.now(timezone.utc),
        gender="Female",
        gestational_age_weeks=39.0,
        birth_weight_kg=3.2,
        birth_length_cm=50.0,
        birth_head_circumference_cm=32.0,
        age_days=index,
        weight_kg=3.2 + index * 0.01,
        length_cm=50.0,
        head_circumference_cm=32.0,
        temperature_c=37.0,
        heart_rate_bpm=150,
        respiratory_rate_bpm=40,
        oxygen_saturation=98,
        feeding_type="Formula",
        feeding_frequency_per_day=8,
        urine_output_count=6,
        stool_count=2,
        jaundice_level_mg_dl=4.2,
        apgar_score=8.0,
        immunizations_done=1,
        reflexes_normal=1,
        sleeping_hours=14,
        vaccination_status="recorded",
        symptoms=[],
    )


def post_reading(reading: NeonatalReading, endpoint: str) -> dict:
    request = Request(endpoint, data=json.dumps(reading.model_dump(mode="json")).encode(), headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode())


def run_simulator(
    count: int,
    interval_seconds: float,
    sender: Callable[[NeonatalReading], object],
    infant_id: str = "simulated-infant",
    stop_requested: Callable[[], bool] | None = None,
    on_error: Callable[[Exception], object] | None = None,
) -> int:
    if count < 0 or interval_seconds < 0:
        raise ValueError("count and interval_seconds must be non-negative")
    sent = 0
    for index in range(count):
        if stop_requested and stop_requested():
            break
        try:
            sender(generate_reading(index, infant_id))
            sent += 1
        except Exception as error:
            if on_error:
                on_error(error)
            else:
                raise
        if sent < count and interval_seconds:
            time.sleep(interval_seconds)
    return sent


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Send finite simulated readings to the local monitoring API.")
    parser.add_argument("--count", type=int, default=3)
    parser.add_argument("--interval", type=float, default=5.0)
    parser.add_argument("--endpoint", default="http://127.0.0.1:8000/monitoring/readings")
    args = parser.parse_args()
    sent = run_simulator(
        args.count,
        args.interval,
        lambda reading: post_reading(reading, args.endpoint),
        on_error=lambda error: print(f"simulator request failed: {error}"),
    )
    print(f"sent {sent} simulated reading(s)")


if __name__ == "__main__":
    main()