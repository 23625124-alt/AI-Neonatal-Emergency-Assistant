# AI-Powered Neonatal Emergency Assistant: XAI Module

## Slide 1: Title

**AI-Powered Neonatal Emergency Assistant: Explainable AI Module**

**Project category:** AI / Healthcare Decision Support  
**Reference number:** [Add reference number]  
**Name of applicant/team:** [Add name]  
**Name of mentor:** [Add mentor name]

---

## Slide 2: Abstract of the Idea / Innovation

This project presents a research prototype for neonatal risk monitoring and explainable decision support. It combines a machine-learning risk classifier with rule-based warning checks, SHAP-based explanations, care guidance, and reminder management.

The system accepts neonatal observations such as temperature, heart rate, respiratory rate, oxygen saturation, weight, feeding frequency, sleep, vaccination status, and reported symptoms. It returns a risk category, the reasons that triggered an urgent review, the model's probability estimate, and guidance for contacting a qualified clinician.

The prototype uses a prepared neonatal dataset, a preprocessing and data-quality audit workflow, a Random Forest classifier, and a local FastAPI service. Explainability is included so that model associations can be inspected instead of presenting an unexplained prediction.

---

## Slide 3: Problem Identification

### Challenges in neonatal monitoring

- Newborn health can change quickly, while observations may be recorded inconsistently.
- Caregivers and health workers need a structured way to record readings and review changes over time.
- A risk score without an explanation is difficult to interpret and verify.
- Important warning signs such as abnormal temperature, low oxygen saturation, rapid breathing, unusual heart rate, and reduced feeding require timely clinical attention.
- Research teams need transparent evidence about data quality, class balance, model performance, and limitations before considering real-world use.

### Problem addressed

There is a need for an accessible, explainable research tool that organizes neonatal observations, highlights configured warning signs, and shows how a baseline machine-learning model arrives at a risk estimate without claiming to diagnose illness.

---

## Slide 4: Background for Getting the Idea / Innovation

### Who is it for?

- Researchers developing neonatal monitoring and explainable-AI methods.
- Students and academic teams studying healthcare machine learning.
- Clinicians and health workers reviewing a prototype decision-support workflow.
- Care teams that need a structured record of readings, care guidance, and reminders during supervised research use.

### What will it do?

- Record and validate neonatal observations through a FastAPI service.
- Apply configured warning rules and return reasons for an urgent review.
- Generate a model prediction and probability when the trained model is available.
- Preserve monitoring history locally for each infant identifier.
- Provide care guidance and create date-based reminders.
- Produce individual, trend, and what-if SHAP explanation outputs.

---

## Slide 5: Uniqueness of the Innovation

- **Explainability by design:** SHAP outputs list the features with the largest positive or negative contribution to a model result.
- **Human-readable warning reasons:** The API reports which configured observations or symptoms triggered an urgent-review status.
- **What-if analysis:** Researchers can change a feature value and inspect how the model output changes.
- **Data-quality transparency:** The preprocessing workflow reports missing values, invalid binary values, suspicious measurements, removed identifiers, and target distribution.
- **Integrated research workflow:** Data preparation, model training, evaluation, explainability, monitoring, care guidance, and reminders are connected in one prototype.
- **Safety boundary:** The system explicitly labels itself as research decision support and does not silently correct suspicious data or present clinical diagnoses.

---

## Slide 6: Objectives of the Innovation

1. Build a reproducible preprocessing workflow for neonatal research data.
2. Train a baseline classifier for the `healthy` and `at risk` categories.
3. Evaluate the model on a held-out test split using accuracy, balanced accuracy, ROC-AUC, a confusion matrix, and a classification report.
4. Generate local explanations for individual observations.
5. Summarize global feature influence across the held-out sample.
6. Support what-if analysis for research experiments.
7. Provide an API for readings, monitoring history, reminders, and care guidance.
8. Keep clinical validation, data provenance, and target-generation review visible as required next steps.

---

## Slide 7: Potential Application in Industry / Market in Brief

### Potential applications

- Neonatal research and academic laboratories.
- Hospital or clinic decision-support research pilots under clinical supervision.
- Public-health and community-health monitoring studies.
- Explainable-AI demonstrations for healthcare education.
- Future integration with validated sensors, dashboards, or mobile applications.

### Adoption opportunities

- Structured digital recording can reduce fragmented observation logs.
- Explainable outputs can support review by clinicians and researchers.
- Data-quality reports can improve research governance and dataset preparation.
- API-based design can support future integration with approved clinical systems.

### Market and impact note

The immediate value is research enablement and safer model inspection. Any clinical or commercial deployment would require prospective validation, regulatory review, privacy controls, clinical workflow testing, and approval by the responsible institution.

---

## Slide 8: Current Development Status of the Innovation by the Applicant

### Stage 1: Dataset preparation

- Source dataset copied into `data/raw/`.
- Prepared dataset written to `data/processed/neonatal_prepared.csv`.
- Data-quality report written to `data/processed/data_quality_report.json`.
- Dataset contains **3,000 rows** and **22 columns including the target**.

### Stage 2: Data-quality audit

- Missing values are counted and reported.
- Binary fields are checked for invalid values.
- Suspicious values are flagged for review rather than changed using invented thresholds.
- Target distribution: **2,602 healthy** and **398 at risk** records.
- Review flags: **7 oxygen-saturation values above 100** and **60 gestational-age values above 42 weeks**.

---

## Slide 9: Current Development Status of the Innovation by the Applicant

### Stage 3: Model training and evaluation

- Scikit-learn pipeline with numeric passthrough and one-hot encoding for categorical data.
- Random Forest classifier with 300 estimators, balanced class weights, and a fixed random state.
- Stratified 80/20 train-test split.
- Model artifact saved under `models/`.
- Evaluation metrics saved under `evaluation/metrics.json`.

### Stage 4: Explainability and service layer

- SHAP individual explanation output.
- Global trend summary across held-out data.
- What-if feature analysis.
- FastAPI endpoints for health, readings, monitoring history, reminders, and care guidance.
- Local JSON persistence for development.

---

## Slide 10: System Workflow

**Input observations**  
Temperature | Heart rate | Respiratory rate | Oxygen saturation | Weight | Feeding | Sleep | Vaccination status | Symptoms

↓

**Validation and data-quality review**  
Schema checks | Missing-value report | Suspicious-value report

↓

**Risk support**  
Configured warning rules + Random Forest model probability

↓

**Explainable output**  
Risk category | Warning reasons | SHAP contributions | What-if comparison

↓

**Care workflow**  
Monitoring history | Care guidance | Reminders | Clinician review

---

## Slide 11: TRL Level and Timeline for 2 Years

### Current estimated TRL: TRL 3

Proof-of-concept research prototype demonstrated through working preprocessing, model, explainability scripts, and a local API. This estimate is not a formal certification.

### Proposed 2-year timeline

**Phase 1: Conceptualization and data readiness (Months 1-4, TRL 3)**

- Verify dataset provenance, consent or usage rights, and target-generation procedure.
- Review suspicious measurements and clinical assumptions with neonatal domain experts.
- Establish reproducible preprocessing, experiment tracking, and data-quality reporting.

**Phase 2: Controlled research testing (Months 5-8, TRL 3-4)**

- Compare baseline models, calibration methods, and decision thresholds.
- Run cross-validation, subgroup analysis, and robustness tests.
- Conduct structured clinician review of warning reasons and SHAP explanations.

**Phase 3: Field-prototype evaluation (Months 9-12, TRL 5-6)**

- Package the API for a controlled, non-diagnostic research environment.
- Test realistic observation entry, missing data, suspicious values, and service failures.
- Evaluate usability with trained research or clinical users using approved scenarios.

**Phase 4: Supervised pilot certification readiness (Months 13-18, TRL 6-7)**

- Add authentication, role-based access, audit logging, privacy controls, and monitoring.
- Integrate only approved data sources and document the intended clinical workflow.
- Complete ethics, safety, cybersecurity, and institutional review before pilot use.

**Phase 5: Prospective pilot assessment (Months 19-24, TRL 7-8)**

- Run a prospective evaluation under institutional and clinical supervision.
- Measure safety, calibration, fairness, reliability, usability, and workflow fit.
- Use the evidence to decide whether a regulated clinical pathway is justified; do not claim TRL 9 without broad real-world validation and authorization.

---

## Slide 12: Existing IPR and Patenting Possibility

### Existing technology areas to review

- Machine-learning risk classification for healthcare observations.
- SHAP and other model-agnostic or model-specific explainability techniques.
- FastAPI and standard open-source Python libraries used in the prototype.
- Digital patient monitoring, alerting, reminder, and clinical decision-support workflows.

### IPR position of this prototype

- The repository uses established open-source methods and libraries rather than claiming ownership of those technologies.
- A patent search and institutional IP review are required before making any patentability claim.
- Potential protectable contribution, if supported by a formal novelty search, may relate to a specific end-to-end workflow for neonatal observation validation, risk support, explanation presentation, and supervised care escalation.
- Clinical claims, datasets, model weights, and patient data require separate legal, privacy, licensing, and ethics review.

---

## Slide 13: Patenting Possibility and Future Development

### Possible future differentiators to investigate

- A validated method for combining neonatal measurement quality signals with interpretable risk support.
- A clinician-reviewed explanation interface that clearly separates model association from medical advice.
- A privacy-preserving, auditable workflow for monitoring history and escalation decisions.
- Robustness and fairness methods evaluated across neonatal subgroups and care settings.

### Required evidence before an IPR decision

- Prior-art and patent-landscape search.
- Documented novelty and inventive-step analysis.
- Verified data rights and open-source license compliance.
- Clinical validation and ethics approvals where applicable.

---

## Slide 14: Thank You

**Thank you**

**Questions?**

### Important research disclaimer

This is a research and learning prototype. It does not diagnose disease, replace clinicians, or establish clinical accuracy. SHAP explanations describe model-learned associations; they are not causal or clinical explanations. Contact a qualified clinician or emergency service for any real health concern.
