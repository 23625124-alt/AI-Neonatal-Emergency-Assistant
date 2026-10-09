export type ModelFeatureFields =
  | 'gender' | 'gestational_age_weeks' | 'birth_weight_kg' | 'birth_length_cm'
  | 'birth_head_circumference_cm' | 'age_days' | 'weight_kg' | 'length_cm'
  | 'head_circumference_cm' | 'temperature_c' | 'heart_rate_bpm'
  | 'respiratory_rate_bpm' | 'oxygen_saturation' | 'feeding_type'
  | 'feeding_frequency_per_day' | 'urine_output_count' | 'stool_count'
  | 'jaundice_level_mg_dl' | 'apgar_score' | 'immunizations_done' | 'reflexes_normal';

export type ApplicationFields = 'sleeping_hours' | 'vaccination_status' | 'symptoms';

export type NeonatalReadingPayload = {
  infant_id: string;
  simulated: boolean;
  recorded_at: string;
  gender: string;
  gestational_age_weeks: number;
  birth_weight_kg: number;
  birth_length_cm: number;
  birth_head_circumference_cm: number;
  age_days: number;
  weight_kg: number;
  length_cm: number;
  head_circumference_cm: number;
  temperature_c: number;
  heart_rate_bpm: number;
  respiratory_rate_bpm: number;
  oxygen_saturation: number;
  feeding_type: string;
  feeding_frequency_per_day: number;
  urine_output_count: number;
  stool_count: number;
  jaundice_level_mg_dl: number;
  apgar_score: number;
  immunizations_done: number;
  reflexes_normal: number;
  sleeping_hours: number;
  vaccination_status: string;
  symptoms: string[];
};
export type BabyProfilePayload = {
  infant_id: string; password: string; gender: string; gestational_age_weeks: number;
  birth_weight_kg: number; birth_length_cm: number; birth_head_circumference_cm: number;
  feeding_type: string; apgar_score: number; vaccination_status: string;
};
export type QuickReadingPayload = {
  infant_id: string; simulated: boolean; recorded_at: string; age_days: number; weight_kg: number;
  length_cm: number; head_circumference_cm: number; temperature_c: number; heart_rate_bpm: number;
  respiratory_rate_bpm: number; oxygen_saturation: number; feeding_frequency_per_day: number;
  urine_output_count: number; stool_count: number; jaundice_level_mg_dl: number;
  immunizations_done: number; reflexes_normal: number; sleeping_hours: number; symptoms: string[];
};
export type BabyAuthResponse = { infant_id: string; status?: string; authenticated?: boolean };

export type Contribution = { feature: string; shap_value: number };
export type Explanation = { top_contributions: Contribution[]; warning: string };
export type ModelResult = { prediction: string; probability_at_risk: number; explanation?: Explanation };
export type MonitoringRecord = NeonatalReadingPayload & {
  id: string;
  risk_level: string;
  risk_reasons: string[];
  risk_basis: string;
  model: ModelResult | null;
  prediction_status: string;
  explanation_status: string;
  prediction_error: string | null;
  explanation_error: string | null;
};
export type MonitoringResponse = { record: MonitoringRecord; action: string; warning: string };
export type HistoryResponse = { infant_id: string; count: number; readings: MonitoringRecord[] };
export type GlobalImportance = { feature: string; mean_absolute_shap: number };
export type GlobalExplanation = { rows_explained: number; global_feature_importance: GlobalImportance[]; warning: string };
export type WhatIfResponse = ModelResult & { what_if_changes: Record<string, number>; top_contributions: Contribution[] };
export type CareGuidance = {
  infant_id: string;
  latest_reading: MonitoringRecord | null;
  guidance: string[];
  reminder_window_days: number;
};
export type ReminderPayload = { infant_id: string; title: string; due_date: string; category: string };
export type Reminder = ReminderPayload & { id: string; created_at: string };
export type FeedingLogPayload = {
  infant_id: string;
  log_date: string;
  feeding_count: number;
  urine_output_count: number;
  stool_count: number;
};
export type FeedingLog = FeedingLogPayload & { id: string; created_at: string };
export type FeedingLogPayload = {
  infant_id: string;
  log_date: string;
  feeding_count: number;
  urine_output_count: number;
  stool_count: number;
};
export type FeedingLog = FeedingLogPayload & { id: string; created_at: string };