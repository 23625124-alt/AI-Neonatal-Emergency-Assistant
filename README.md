# AI-Neonatal-XAI

## Short Project Overview

AI-Neonatal-XAI is an Explainable AI (XAI) research and proof-of-concept project for neonatal risk prediction and structured monitoring support. Its implemented core prepares a neonatal dataset, trains a Random Forest classifier, evaluates it on a held-out split, generates SHAP explanations, and exposes a local FastAPI service.

This is **not a medical diagnostic tool**. It does not diagnose disease, prescribe treatment, or replace a qualified clinician. Clinical validation is not established, and the prototype must not be used for real-world clinical decisions.

## Problem Being Addressed

Neonatal observations can be varied, difficult to review consistently, and sensitive to data-quality problems. A risk prediction without an explanation is also difficult for researchers and clinicians to inspect. This project explores a transparent research workflow that combines model-based risk estimates with feature-level explanations and explicit safety warnings.

## Our Solution

The current software provides:

- Dataset preparation and data-quality reporting.
- A scikit-learn preprocessing and Random Forest classification pipeline.
- Held-out evaluation metrics.
The working repository contains the research/ML core, a local development API, a finite software-only sensor simulator, and a React Native monitoring client under `module-3/`. The core pipeline, simulator path, frontend checks, and local HTTP monitoring flow have been exercised. Physical sensor integration, cloud persistence, and notification services are not present.
- A local FastAPI service for manually submitted readings, monitoring history, reminders, and care guidance.

The API also applies configurable demonstration-threshold warning checks to submitted readings. These rules and model outputs are research support only.

## Key Innovation: Explainable AI

The central differentiator is: **Instead of only predicting neonatal risk, the system aims to explain why the model produced that prediction.**

The implemented XAI workflow includes:

- **Individual feature contributions:** SHAP values are ranked for a selected held-out row.
- **Global feature importance:** Mean absolute SHAP values are summarized across the held-out sample.
- **What-if analysis:** A command-line feature value can be changed to inspect the resulting model prediction and explanation.

SHAP values describe associations learned by this model. They are not causal explanations, medical advice, or evidence of clinical importance.

## Current Prototype Status

The working repository contains the research/ML core, a local development API, a finite software-only sensor simulator, and a React Native monitoring client under `module-3/`. The core pipeline, simulator path, frontend checks, and local HTTP monitoring flow have been exercised. Physical sensor integration, cloud persistence, and notification services are not present.
| React Native monitoring client | Implemented and tested | `module-3/App.tsx`; Jest, ESLint, and TypeScript checks pass |

## Current Implemented Features

| Feature | Status | Evidence |
|---|---|---|
| Neonatal dataset preprocessing | Implemented | `xai-module/preprocessing/preprocess.py` |
| Data-quality checking | Implemented | `data_quality_report.json` |
| Conditional identifier/date/name removal | Implemented in code; not exercised by current source columns | `REMOVED_COLUMNS` and audit report |
| Mixed numeric/categorical ML preprocessing | Implemented | `ColumnTransformer` and `OneHotEncoder` |
| Random Forest risk model | Implemented; saved artifact present | `models/train_model.py`, `.joblib` |
Manual input, the finite simulator, and the React Native client integration are implemented. Long-running production monitoring, device integration, and operational controls remain future work.
| SHAP individual explanations | Implemented in code | `explainability/explain.py` |
| SHAP global feature importance | Implemented in code | `explainability/explain.py` |
| SHAP what-if analysis | Implemented in code and CLI | `--what-if` in `explain.py` |
- Physical sensor integration
| FastAPI local backend | Implemented in code | `api/main.py` |
| Manual reading input | Implemented through `POST /monitoring/readings` | `NeonatalReading` schema |
| Finite software sensor simulator | Implemented for development demonstrations | `monitoring/simulator.py`; real HTTP smoke-tested |
| React Native monitoring client | Implemented and tested | `module-3/App.tsx`; Jest, ESLint, and TypeScript checks pass |
| Local monitoring/reminder persistence | Implemented using JSON files | `data/processed/` at runtime |
| Physical sensors | Future scope | No implementation found |

## AI/ML Pipeline

1. Read the raw CSV and require the `risk_level` target.
2. Conditionally remove configured identifier, name, and date fields.
3. Report missing values, invalid binary values, suspicious values, and target counts.
4. Split features and target, then use a stratified 80/20 train-test split with `random_state=42`.
5. Pass numeric columns through and one-hot encode categorical columns.
6. Train a balanced `RandomForestClassifier` with 300 trees.
7. Save the pipeline, held-out test data, and model metadata.
8. Evaluate predictions and probabilities on the held-out data.

The checked-in metadata records 2,400 training rows and 600 test rows. The checked-in metrics report accuracy 1.0, balanced accuracy 1.0, and ROC-AUC 1.0. These results apply only to this dataset split and are flagged for target-leakage or synthetic-label review; they do not establish clinical accuracy.

## XAI Workflow

A selected held-out row is transformed using the trained model's preprocessing step. `shap.TreeExplainer` calculates contributions from the Random Forest, which are ranked and written to JSON. Trend analysis calculates mean absolute SHAP values across the held-out sample. Optional what-if values replace selected row features before prediction and explanation.

Generated explanation files are written at runtime to `xai-module/explainability/outputs/`. Monitoring and reminder records are written to local JSON files in `xai-module/data/processed/`.

## Current Data Strategy

1. **Public/Kaggle-style neonatal dataset:** The checked-in CSV is used for model development, training, and evaluation. It is a research dataset, not a live patient database.
2. **Manual or simulated readings:** The current API accepts manually submitted readings, and the finite software simulator sends schema-valid simulated readings to that API. These are application inputs, not physical sensor data.
3. **Planned application persistence:** MongoDB Atlas is planned for application-level records, monitoring history, predictions, and XAI outputs. It is not implemented here; current runtime persistence is local JSON.

The current quality report describes 3,000 rows, no missing values, 398 `at risk` and 2,602 `healthy` records, 7 oxygen-saturation values above 100, and 60 gestational-age values above 42 weeks. Suspicious values are reported rather than silently changed.

## Continuous Monitoring
|-- module-3/                         # React Native monitoring client

The software-based sensor simulator is implemented for finite development demonstrations. It generates schema-valid readings, marks them as simulated, sends them to the existing monitoring endpoint, supports configurable intervals and finite counts, and stops early when requested by its programmatic runner. It does not represent physical sensors.

The present local API can receive individual manual or simulator readings, apply configurable demonstration warning rules, attach a saved-model prediction and SHAP explanation when available, and retain records in a local JSON file. It also exposes global and what-if XAI routes. This remains a development demonstration rather than physical or production continuous monitoring.
    -> FastAPI
```

    -> Risk prediction
    -> SHAP
    -> Explainable risk
    -> Demo alert / guidance
```

Manual input and the finite simulator are implemented. Long-running production monitoring, device integration, and operational controls remain future work.

**CORE INNOVATION: Explainable AI.** The training dataset is used for model development and evaluation, while new manual or simulated monitoring readings are used as application inputs for prediction.

### Planned

```text
Parent Mobile App + Doctor Web Dashboard
    -> FastAPI
    -> AI/XAI
    -> MongoDB Atlas
    -> Notifications
```

Firebase Cloud Messaging, MongoDB Atlas, a parent mobile app, and a doctor dashboard are planned application-layer work, not completed features in this repository.

## Technology Stack

### Present in the repository

- Python
- pandas, NumPy, SciPy
- scikit-learn
- SHAP, joblib, matplotlib
- FastAPI, Pydantic, and Uvicorn
- CSV and local JSON files for data and development persistence

### Explicitly planned, not implemented

- Physical sensor integration
- Parent mobile application
- Doctor web dashboard
- MongoDB Atlas
- Firebase Cloud Messaging
- Physical sensor integration

## Project Architecture / Workflow

```text
xai-module/data/raw/neonatal_model_candidate.csv
    -> preprocessing.preprocess
xai-module/data/processed/neonatal_prepared.csv
    -> models.train_model
xai-module/models/neonatal_risk_model.joblib
    -> evaluation.evaluate_model -> evaluation/metrics.json
    -> explainability.explain -> explainability/outputs/*.json
    -> api.main -> local monitoring and care JSON files
```

## Repository Structure

```text
.
|-- README.md
|-- PROJECT_HANDOFF_FOR_CHATGPT.md
|-- notebooks/                         # Currently empty
`-- xai-module/
    |-- requirements.txt
    |-- README.md
    |-- data/
    |   |-- raw/neonatal_model_candidate.csv
    |   `-- processed/
    |       |-- neonatal_prepared.csv
    |       `-- data_quality_report.json
    |-- preprocessing/preprocess.py
    |-- models/
    |   |-- train_model.py
    |   |-- neonatal_risk_model.joblib
    |   |-- test_data.csv
    |   `-- model_metadata.json
    |-- evaluation/
    |   |-- evaluate_model.py
    |   `-- metrics.json
    |-- explainability/explain.py
    |-- api/main.py
    |-- monitoring/simulator.py
    |-- tests/
    |   |-- test_monitoring_api.py
    |   `-- test_simulator.py
    |-- neonatal_xai_workflow.svg
    `-- neonatal_xai_trl_timeline.svg
```

The `module-3/` directory contains the React Native client, its native Android/iOS project, typed API client, and frontend tests.

## How to Set Up the Project

From the repository root, create and activate a virtual environment, then install the module dependencies:

```powershell
cd xai-module
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

On a system where PowerShell execution policy prevents activation, run the Python commands with the environment's interpreter directly or use the equivalent activation command for your shell.

## How to Run the Preprocessing Pipeline

Run from `xai-module`:

```powershell
python -m preprocessing.preprocess
```

This writes `data/processed/neonatal_prepared.csv` and `data/processed/data_quality_report.json`.

## How to Train the Model

```powershell
python -m models.train_model
```

This writes the Random Forest pipeline, held-out test data, and metadata under `models/`.

## How to Evaluate the Model

```powershell
python -m evaluation.evaluate_model
```

This loads the saved model and held-out data, then writes accuracy, balanced accuracy, ROC-AUC, confusion matrix, and classification-report data to `evaluation/metrics.json`.

## How to Run SHAP/XAI Analysis

Explain one held-out row:

```powershell
python -m explainability.explain --row-index 0
```

Run global trend analysis:

```powershell
python -m explainability.explain --trend
```

Run what-if analysis for a numeric feature:

```powershell
python -m explainability.explain --row-index 0 --what-if temperature_c=37.0
```

## How to Run the FastAPI Backend

Run from `xai-module` after installing dependencies:

```powershell
uvicorn api.main:app --reload
```

Interactive documentation is available at `http://127.0.0.1:8000/docs` while the development server is running.

In another terminal, send three finite simulated readings to the running server:

```powershell
python -m monitoring.simulator --count 3 --interval 2
```

## Verified API Surface

The source defines these routes:

- `GET /health`: reports API status and whether the saved model file exists.
- `POST /monitoring/readings`: validates and stores a manual reading, applies configured warning rules, and attaches model output when the model is available.
- `GET /monitoring/{infant_id}`: returns locally stored reading history.
- `GET /xai/global`: returns global SHAP feature importance for the held-out sample.
- `POST /xai/what-if`: applies numeric feature changes to a complete reading and returns prediction plus SHAP contributions.
- `POST /care/reminders`: stores a local date-based reminder.
- `GET /care/{infant_id}`: returns the latest local reading and prototype care guidance.

There is no separately implemented `/prediction` or `/xai` endpoint. The monitoring route generates an individual SHAP explanation through the shared explainability service; the React Native client renders that response, while standalone CLI trend and what-if workflows remain available.

Example health request:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

Example manual reading request:

```powershell
$body = @{
    infant_id = "demo-infant-1"
    temperature_c = 37.0
    heart_rate_bpm = 150
    respiratory_rate_bpm = 40
    oxygen_saturation = 98
    weight_kg = 3.2
    feeding_frequency_per_day = 8
    sleeping_hours = 14
    vaccination_status = "recorded"
    symptoms = @()
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/monitoring/readings -ContentType "application/json" -Body $body
```

The API reading schema requires all 21 model features recorded in `models/model_metadata.json`. `sleeping_hours`, `vaccination_status`, `symptoms`, and `simulated` are application/monitoring fields and are not training features. No model fields are filled with defaults. Alert thresholds are demonstration configuration, not medically validated thresholds.

## Current Limitations

- No physical sensor integration exists.
- Long-running production continuous monitoring and physical device integration do not exist.
- The React Native client is a development monitoring interface; a production parent app and doctor dashboard do not exist.
- MongoDB Atlas and Firebase Cloud Messaging are not integrated.
- Clinical validation, prospective testing, calibration, subgroup analysis, and safety review have not been performed.
- The public/Kaggle-style data may not represent all neonatal populations or care settings.
- The target-generation process and data provenance require research-team review.
- Perfect checked-in holdout metrics require target-leakage and synthetic-label investigation.
- SHAP outputs describe model associations and are not causal or clinical explanations.
- Local JSON persistence is suitable only for development and does not provide production security, access control, auditability, or reliable multi-user storage.
- Focused monitoring tests cover schema validation, model attachment, SHAP response generation, SHAP failure fallback, missing model fields, simulator behavior, and repeated readings.
- The FastAPI `TestClient` could not be used in the current environment because its installed Starlette version requires the unavailable `httpx2` package.

## Responsible AI and Clinical Safety

- This project is a research/proof-of-concept system, not a medical diagnostic tool.
- Public or anonymized data should be used for research where applicable; personally identifiable information should not be collected unnecessarily.
- Predictions and rule-based warnings are decision-support signals only.
- The system makes no diagnosis or treatment claim and does not replace human or clinical oversight.
- Clinical validation is not established.
- Real deployment would require privacy, ethical, regulatory, cybersecurity, and clinical workflow review.
- Dataset bias, missing populations, measurement quality, target construction, and model limitations must be assessed before interpretation.
- Any real concern about a baby's health should be handled by a qualified clinician or appropriate emergency service.

## Future Scope

- Establish a safe continuous-monitoring workflow with reviewed alert behavior.
- Build supervised parent and clinician interfaces.
- Add approved persistence, authentication, authorization, audit logging, monitoring, and secure deployment.
- Evaluate alternative models, calibration, thresholds, robustness, fairness, and subgroup performance.
- Review dataset provenance, target generation, ethics, privacy, and regulatory requirements.
- Conduct clinical and prospective validation before considering any real-world use.
- Investigate physical sensor integration only after the software workflow and safety requirements are established.

## Project Status / Roadmap

| Component | Status |
|---|---|
| Dataset preprocessing | Implemented; checked-in output present |
| ML risk prediction | Implemented; saved model present |
| Model evaluation | Implemented; checked-in metrics present; validation caveats apply |
| SHAP XAI | Implemented and tested through monitoring response and CLI workflows |
| FastAPI backend | Implemented as a local development API; real HTTP smoke-tested |
| Manual input | Implemented through the monitoring-reading API |
| Sensor simulator | Implemented for finite development demonstrations |
| React Native monitoring client | Implemented and tested; native device build pending |
| Parent Mobile App | Planned |
| Doctor Dashboard | Planned |
| MongoDB Atlas application persistence | Planned; local JSON is used currently |
| Physical sensors | Future Scope |
| Clinical validation | Future Scope |

## Team / Contributions

No team-member or contribution information is defined in the repository. Contributions should preserve the research-prototype boundary, document evidence for implemented behavior, and maintain the clinical-safety warnings.
