# AI-Powered Neonatal Emergency Assistant: XAI Module

This repository contains an Explainable AI research prototype and a FastAPI service for neonatal monitoring, risk support, care guidance, reminders, and optional MongoDB persistence. It does not provide clinical diagnosis or Firebase notifications.

## Setup

```powershell
cd path\to\AI-Neonatal-XAI
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

The source dataset is copied to `data/raw/neonatal_model_candidate.csv`. The original file in Downloads is never modified.

## Run the workflow

```powershell
python -m preprocessing.preprocess
python -m models.train_model
python -m evaluation.evaluate_model
python -m explainability.explain --row-index 0
python -m explainability.explain --trend
python -m explainability.explain --row-index 0 --what-if temperature_c=37.0
uvicorn api.main:app --reload
```

The API exposes `GET /health`, `POST /monitoring/readings`, `GET /monitoring/{infant_id}`, `GET /xai/global`, `POST /xai/what-if`, `POST /care/reminders`, and `GET /care/{infant_id}`. Interactive API documentation is available at `http://127.0.0.1:8000/docs` while the server is running. Monitoring data is stored locally under `data/processed/` for development.

The scripts save prepared data, a quality report, a model, evaluation metrics, and explanation files under `data/processed/`, `models/`, `evaluation/`, and `explainability/`.

## Important limitations

This is a research and learning prototype. It does not diagnose disease, replace clinicians, or establish clinical accuracy. The target-generation method, data provenance, measurement validity, and prediction time point must be reviewed by the project team. The current holdout evaluation produces perfect or near-perfect metrics and is flagged for target-leakage or synthetic-label review. SHAP explanations describe this model's learned associations; they are not causal or clinical explanations. Suspicious values are reported for review rather than silently changed.

The full reading endpoint collects the model fields. The lightweight endpoint loads stable profile values saved at baby registration and requires changing monitoring values explicitly; it does not silently invent missing clinical data.

## MongoDB and lightweight monitoring

Set `MONGODB_URI` and optionally `MONGODB_DATABASE` before starting the API. When MongoDB is unavailable, the API automatically uses the existing JSON development store and reports the active backend through `GET /health`.

1. Create a baby login with `POST /babies/register`. Passwords are stored as one-way scrypt hashes; the API never returns them.
2. Authenticate with `POST /babies/login`.
3. Send only changing values such as temperature, heart rate, oxygen saturation, feeding, urine, stool, sleep, and symptoms to `POST /monitoring/quick-readings`. Stable birth/profile values are loaded from the saved baby profile.
4. The simulator continues sending readings to `POST /monitoring/readings` and can use the same MongoDB-backed store.

Example PowerShell configuration:

```powershell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>/<database>"
$env:MONGODB_DATABASE = "neonatal_xai"
py -3.12 -m uvicorn api.main:app --reload
```
