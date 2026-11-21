import { API_BASE_URL } from '../config/environment';

import {
  BabyAuthResponse,
  BabyProfilePayload,
  CareGuidance,
  FeedingLog,
  FeedingLogPayload,
  GlobalExplanation,
  HealthResponse,
  HistoryResponse,
  MonitoringResponse,
  NeonatalReadingPayload,
  QuickReadingPayload,
  Reminder,
  ReminderPayload,
  WhatIfResponse,
} from '../types/api';

/*
 * Common API Request Handler
 */
async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    throw new Error(
      'Unable to reach the FastAPI backend. Check that it is running and the device URL is correct.',
    );
  }

  if (!response.ok) {
    let message = `Backend request failed (${response.status}).`;

    try {
      const errorData = await response.json();

      if (errorData?.detail) {
        message =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

/*
 * Health Check
 */
export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

/*
 * User Registration
 */
export function registerUser(
  username: string,
  password: string,
  fullName: string,
  role: string,
  phone: string,
  email: string,
  baby_id: string,
): Promise<any> {
  return request<any>('/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      full_name: fullName,
      role,
      phone,
      email,
      baby_id,
    }),
  });
}

/*
 * User Login
 */
export function loginUser(
  username: string,
  password: string,
): Promise<any> {
  return request<any>('/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

/*
 * Get Users
 */
export function getUsers(): Promise<any> {
  return request<any>('/users');
}

/*
 * Baby Profile
 */
export function createBabyProfile(
  profile: BabyProfilePayload,
): Promise<any> {
  return request<any>('/babies/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });
}

export function getBabyProfile(
  infantId: string,
): Promise<any> {
  return request<any>(
    `/babies/${encodeURIComponent(infantId)}`,
  );
}

export function getBabies(): Promise<any> {
  return request<any>('/babies');
}

/*
 * Legacy Baby Authentication
 */
export function registerBaby(
  profile: BabyProfilePayload,
): Promise<BabyAuthResponse> {
  return request<BabyAuthResponse>('/babies/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });
}

export function loginBaby(
  infantId: string,
  password: string,
): Promise<BabyAuthResponse> {
  return request<BabyAuthResponse>('/babies/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      infant_id: infantId,
      password,
    }),
  });
}

/*
 * Monitoring History
 */
export function getMonitoringHistory(
  infantId: string,
): Promise<HistoryResponse> {
  return request<HistoryResponse>(
    `/monitoring/${encodeURIComponent(infantId)}`,
  );
}

/*
 * Submit Full Health Reading
 */
export function submitReading(
  reading: NeonatalReadingPayload,
): Promise<MonitoringResponse> {
  return request<MonitoringResponse>('/monitoring/readings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reading),
  });
}

/*
 * Submit Quick Health Reading
 */
export function submitQuickReading(
  reading: QuickReadingPayload,
): Promise<MonitoringResponse> {
  return request<MonitoringResponse>(
    '/monitoring/quick-readings',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reading),
    },
  );
}

/*
 * Global Explainable AI
 */
export function getGlobalExplanation(): Promise<GlobalExplanation> {
  return request<GlobalExplanation>('/xai/global');
}

/*
 * What-If Explainable AI
 */
export function getWhatIfExplanation(
  reading: NeonatalReadingPayload,
  changes: Record<string, number>,
): Promise<WhatIfResponse> {
  return request<WhatIfResponse>('/xai/what-if', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reading,
      changes,
    }),
  });
}

/*
 * Care Guidance
 */
export function getCareGuidance(
  infantId: string,
): Promise<CareGuidance> {
  return request<CareGuidance>(
    `/care/${encodeURIComponent(infantId)}`,
  );
}

/*
 * Create Care Reminder
 */
export function createReminder(
  reminder: ReminderPayload,
): Promise<Reminder> {
  return request<Reminder>('/care/reminders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reminder),
  });
}

/*
 * Get Care Reminders
 */
export function getReminders(
  infantId: string,
): Promise<Reminder[]> {
  return request<Reminder[]>(
    `/care/reminders/${encodeURIComponent(infantId)}`,
  );
}

/*
 * Create Feeding Log
 */
export function createFeedingLog(
  log: FeedingLogPayload,
): Promise<FeedingLog> {
  return request<FeedingLog>('/feeding-logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(log),
  });
}

/*
 * Get Feeding Logs
 */
export function getFeedingLogs(
  infantId: string,
): Promise<FeedingLog[]> {
  return request<FeedingLog[]>(
    `/feeding-logs/${encodeURIComponent(infantId)}`,
  );
}

/*
 * Update Feeding Log
 */
export function updateFeedingLog(
  infantId: string,
  logDate: string,
  values: Omit<FeedingLogPayload, 'infant_id' | 'log_date'>,
): Promise<FeedingLog> {
  return request<FeedingLog>(
    `/feeding-logs/${encodeURIComponent(infantId)}/${encodeURIComponent(logDate)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    },
  );
}

/* ============================================================
 * APPOINTMENT API
 * ============================================================
 */

export interface AppointmentPayload {
  infant_id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
}

export interface Appointment extends AppointmentPayload {
  appointment_id: string;
  status: string;
  created_at?: string;
}

/*
 * Create Appointment
 */
export function createAppointment(
  appointment: AppointmentPayload,
): Promise<Appointment> {
  return request<Appointment>('/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointment),
  });
}

/*
 * Get All Appointments
 */
export function getAllAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/appointments');
}

/*
 * Get Appointments For A Specific Baby
 */
export function getAppointmentsByBaby(
  infantId: string,
): Promise<Appointment[]> {
  return request<Appointment[]>(
    `/appointments/${encodeURIComponent(infantId)}`,
  );
}

/*
 * Cancel Appointment
 */
export function cancelAppointment(
  appointmentId: string,
): Promise<Appointment> {
  return request<Appointment>(
    `/appointments/${encodeURIComponent(appointmentId)}/cancel`,
    {
      method: 'PATCH',
    },
  );
}