# AI-Powered Neonatal Emergency Assistant: XAI Module

This repository contains an Explainable AI research prototype and a local FastAPI service for neonatal monitoring, risk support, care guidance, and reminders. It does not provide clinical diagnosis, a React/React Native client, MongoDB Atlas persistence, or Firebase notifications yet.

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

The API reading schema currently collects fewer fields than the training dataset. Missing model fields use development-time defaults for prediction and must be added to the API contract or handled with an approved missing-data strategy before real-world evaluation.
