# AI-Neonatal-XAI: Project Completion and Module 3 Review

**Review date:** 2026-08-26  
**Project type:** Research and proof-of-concept neonatal risk prediction/XAI system

## Important Scope Note

The repository does not contain a separately named Module 3 directory, sensor adapter, or production scheduler. A finite software simulator now exists under `xai-module/monitoring/`, but Git history shows the original monitoring code was added as part of the main XAI prototype, not by a separately identifiable teammate contribution.

The existing monitoring implementation is [xai-module/api/main.py](xai-module/api/main.py). The first commit adding it is:

- **Commit:** `2a90fff47f0d3fa9a05a631fe44d0923352ea554`
- **Author shown by Git:** Madhumitha S, `23625124@vistas.ac.in`
- **Commit message:** `Add neonatal XAI research prototype`

Therefore, this review cannot accurately state that a specific friend authored Module 3. That attribution requires a separate commit, branch, or file provided by the team.

## Current Project Completion

| Area | Current status | Evidence and assessment |
|---|---|---|
| Dataset preparation | Completed in source and artifact | `preprocessing/preprocess.py` writes the prepared CSV and quality report. |
| Data-quality checks | Completed | Missing values, binary values, suspicious values, target counts, and configured identifier/date/name removal are implemented. |
| ML preprocessing | Completed | Numeric passthrough and categorical one-hot encoding are implemented. |
| Random Forest model | Completed as a research baseline | A balanced 300-tree classifier is trained and a `.joblib` artifact is present. |
| Held-out evaluation | Completed as an implementation | Accuracy, balanced accuracy, ROC-AUC, confusion matrix, and classification report are implemented. |
| Model evaluation evidence | Available with a major caveat | Checked-in metrics are perfect, and the code flags possible target leakage or synthetic labels for review. |
| Individual SHAP explanation | Completed in source | `explainability/explain.py --row-index 0` executed successfully. |
| Global SHAP importance | Completed in source | `explainability/explain.py --trend` executed successfully. |
| What-if analysis | Completed in source | `--what-if feature=value` is implemented. |
| FastAPI backend | Implemented as a local development API | Health, monitoring, history, reminders, and care-guidance routes are defined. |
| Manual monitoring input | Implemented | `POST /monitoring/readings` validates and stores readings. |
| AI prediction from a manual reading | Implemented in the API path | A saved model prediction is attached when the model file exists. |
| XAI from a monitoring API request | Implemented and tested | The monitoring path calls the shared SHAP service and returns top contributions; CLI trend and what-if workflows remain available. |
| Local monitoring persistence | Implemented for development | JSON files are used under `data/processed/`. |
| Software sensor simulator | Implemented for finite demonstrations | `monitoring/simulator.py` generates schema-valid simulated readings and posts them to the existing API. |
| Continuous monitoring | Limited prototype demonstration | Finite repeated HTTP readings are supported; production long-running monitoring is not implemented. |
| Physical sensors | Future scope | No hardware integration exists. |
| Parent mobile app | Planned | No frontend source exists. |
| Doctor web dashboard | Planned | No frontend source exists. |
| MongoDB Atlas | Planned | No MongoDB integration or connection configuration exists. |
| Firebase notifications | Planned | No Firebase integration exists. |
| Clinical validation | Future scope | No clinical validation or prospective study is present. |

## Validation Performed

The following commands were run successfully from `xai-module` using the existing project environment:

```powershell
python -m preprocessing.preprocess
python -m models.train_model
python -m evaluation.evaluate_model
python -m explainability.explain --row-index 0
python -m explainability.explain --trend
```

Focused monitoring tests were also added and passed:

```text
Ran 3 tests
OK
```

The tests cover:

- Valid reading reaches the saved model.
- Demonstration rule produces an urgent-review status.
- Invalid oxygen saturation is rejected.

The FastAPI `TestClient` could not be used because the installed Starlette package requires `httpx2`, which is not available in the current environment. Direct route import and core monitoring function checks succeeded.

## What the Existing Monitoring Code Does

The API accepts a manually submitted `NeonatalReading` containing:

- Infant identifier
- Timestamp
- Temperature
- Heart rate
- Respiratory rate
- Oxygen saturation
- Weight
- Feeding frequency
- Sleeping hours
- Vaccination status
- Reported symptoms

`POST /monitoring/readings` then:

1. Validates the request with Pydantic.
2. Applies configured demonstration warning rules.
3. Generates a Random Forest prediction when the saved model exists.
4. Stores the record locally in JSON.
5. Returns the record, a prototype action string, and a research warning.

The API also provides:

- `GET /health`
- `GET /monitoring/{infant_id}`
- `POST /care/reminders`
- `GET /care/{infant_id}`

There is no physical sensor route. The monitoring route directly returns a shared-service SHAP explanation when prediction succeeds.

## Confirmed Problems and Corrections

### 1. No separately verifiable Module 3 contribution

**Finding:** No Module 3 source or separate teammate commit exists in the reachable Git history. The existing monitoring API was committed by the repository author.

**Impact:** It is not possible to verify what your friend implemented or assign responsibility for a separate module from this repository alone.

**Correction:** Do not describe the current API as a completed sensor-simulator or continuous-monitoring module. Ask for the friend's commit hash, branch, or files if a separate contribution exists outside this repository.

### 2. Monitoring thresholds were implicit demonstration rules

**Finding:** The API used fixed values for temperature, oxygen saturation, heart rate, respiratory rate, and feeding frequency. These values were not explicitly identified as medically validated or demonstration-only.

**Risk:** Users could mistake prototype thresholds for clinical thresholds.

**Correction already applied:** Thresholds are now grouped in `DEMONSTRATION_THRESHOLDS`, and API records include:

```text
risk_basis: demonstration thresholds and reported symptoms
```

Responses also identify the alert as a demonstration rule alert and avoid claiming a diagnosis.

### 3. Emergency wording was too strong for an unvalidated prototype

**Finding:** The API previously returned `contact emergency services now` for an urgent-review rule result.

**Risk:** This could be interpreted as validated medical triage advice.

**Correction already applied:** The response now says `seek urgent clinical assessment` and retains a warning to contact a qualified clinician.

### 4. The API input does not cover all model features

**Finding:** The model was trained with features such as gestational age, birth measurements, length, head circumference, urine output, stool count, jaundice level, Apgar score, immunization status, and reflex status. The API reading schema supplies only a subset.

**Current behavior:** Missing model fields are filled with development-time defaults before prediction.

**Risk:** The API prediction does not represent a fully specified model input and should not be treated as clinically meaningful.

**Required correction:** Define and validate a reviewed application input contract, or implement an approved missing-data strategy. This requires research and clinical-domain review; do not invent defaults or thresholds.

### 5. Monitoring API does not trigger SHAP explanations

**Finding:** The original monitoring endpoint attached model prediction and transformed model feature names, but did not call the SHAP implementation for the submitted reading.

**Impact:** The desired architecture was only partially connected before this implementation.

**Correction applied:** Added the shared `explain_prediction()` service, called it from the monitoring path, added SHAP failure handling, and tested the response and fallback behavior. The existing SHAP implementation remains intact.

### 6. Simulator was missing

**Finding:** No simulator existed in the original repository.

**Impact:** The project previously could not demonstrate sensor-simulator input.

**Correction applied:** Added `monitoring/simulator.py` with finite counts, configurable intervals, stop callbacks, network posting, schema validation, simulated markers, and tests. It does not represent physical sensors.

### 7. Route-level HTTP tests are limited

**Finding:** The core API functions and route inventory were checked, but full HTTP tests were blocked by the missing `httpx2` dependency required by the installed Starlette TestClient.

**Correction applied:** A real Uvicorn HTTP smoke test verified health, two simulator POSTs with generated explanations, and 422 invalid-input handling. The installed environment still lacks `httpx`/`httpx2`, so TestClient-based automated route tests remain unavailable.

## Recommended Target Architecture

```text
Manual input / software sensor simulator
                |
                v
       Continuous monitoring layer
                |
                v
          FastAPI backend
                |
                v
     Validation and input mapping
                |
                v
       Existing Random Forest model
                |
                v
          Risk prediction
                |
                v
        Existing SHAP workflow
                |
                v
   Explainable prediction and demo alert
                |
                v
       Local development storage
```

For the present repository, manual input, finite simulator input, FastAPI routing, model prediction, local storage, and direct API-to-SHAP output are verified. Production long-running monitoring and physical device integration remain incomplete.

## Required Actions Before Calling Module 3 Complete

1. Obtain the actual Module 3 commit hash or branch from the teammate.
2. Confirm the files and author using `git show --stat <commit-hash>`.
3. Keep the simulator as a distinct, clearly named source module.
4. Preserve schema validation, simulated markers, finite counts, and stop controls.
5. Keep simulator output connected to the existing FastAPI endpoint rather than creating another model or prediction path.
6. Keep demonstration thresholds configurable and explicitly non-clinical.
7. Add route-level automated HTTP tests after resolving the test-client dependency.
8. Re-run the complete pipeline and monitoring demonstration after future changes.

## Final Assessment

The project is a functioning research prototype for dataset preparation, Random Forest modeling, evaluation, standalone SHAP analysis, and local manual-reading API support.

Module 3 is **partially implemented as a finite software demonstration in this repository**. The API supports manual and simulated readings, model prediction, and direct SHAP explanations. Production continuous monitoring, physical sensors, separate teammate attribution, and automated HTTP TestClient coverage remain incomplete. The main remaining actions are to obtain the missing teammate contribution if one exists externally, resolve the HTTP test dependency, and retain strict research/non-diagnostic wording.
