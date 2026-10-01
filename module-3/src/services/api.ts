import { API_BASE_URL } from '../config/environment';
import { BabyAuthResponse, BabyProfilePayload, CareGuidance, GlobalExplanation, HistoryResponse, MonitoringResponse, NeonatalReadingPayload, QuickReadingPayload, Reminder, ReminderPayload, WhatIfResponse } from '../types/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error('Unable to reach the FastAPI backend. Check that it is running and the device URL is correct.');
  }
  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function submitReading(reading: NeonatalReadingPayload): Promise<MonitoringResponse> {
  return request<MonitoringResponse>('/monitoring/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reading),
  });
}

export function getMonitoringHistory(infantId: string): Promise<HistoryResponse> {
  return request<HistoryResponse>(`/monitoring/${encodeURIComponent(infantId)}`);
}

export function getGlobalExplanation(): Promise<GlobalExplanation> {
  return request<GlobalExplanation>('/xai/global');
}

export function getWhatIfExplanation(reading: NeonatalReadingPayload, changes: Record<string, number>): Promise<WhatIfResponse> {
  return request<WhatIfResponse>('/xai/what-if', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reading, changes }),
  });
}

export function getCareGuidance(infantId: string): Promise<CareGuidance> {
  return request<CareGuidance>(`/care/${encodeURIComponent(infantId)}`);
}

export function createReminder(reminder: ReminderPayload): Promise<Reminder> {
  return request<Reminder>('/care/reminders', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(reminder),
  });
}

export function registerBaby(profile: BabyProfilePayload): Promise<BabyAuthResponse> {
  return request<BabyAuthResponse>('/babies/register', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(profile)});
}

export function loginBaby(infantId: string, password: string): Promise<BabyAuthResponse> {
  return request<BabyAuthResponse>('/babies/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({infant_id: infantId, password})});
}

export function submitQuickReading(reading: QuickReadingPayload): Promise<MonitoringResponse> {
  return request<MonitoringResponse>('/monitoring/quick-readings', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(reading)});
}