import {API_BASE_URL} from '../config/environment';

import {
  BabyAuthResponse,
  BabyProfilePayload,
  CareGuidance,
  FeedingLog,
  FeedingLogPayload,
  GlobalExplanation,
  HistoryResponse,
  MonitoringResponse,
  NeonatalReadingPayload,
  QuickReadingPayload,
  Reminder,
  ReminderPayload,
  WhatIfResponse,
} from '../types/api';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      options,
    );
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
            : message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getMonitoringHistory(
  infantId: string,
): Promise<HistoryResponse> {
  return request<HistoryResponse>(
    `/monitoring/${encodeURIComponent(infantId)}`,
  );
}

export function getGlobalExplanation(): Promise<GlobalExplanation> {
  return request<GlobalExplanation>('/xai/global');
}

export function getWhatIfExplanation(
  reading: NeonatalReadingPayload,
  changes: Record<string, number>,
): Promise<WhatIfResponse> {
  return request<WhatIfResponse>(
    '/xai/what-if',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reading,
        changes,
      }),
    },
  );
}

export function getCareGuidance(
  infantId: string,
): Promise<CareGuidance> {
  return request<CareGuidance>(
    `/care/${encodeURIComponent(infantId)}`,
  );
}

export function createReminder(
  reminder: ReminderPayload,
): Promise<Reminder> {
  return request<Reminder>(
    '/care/reminders',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminder),
    },
  );
}

/*
 * Baby Profile
 */
export function createBabyProfile(
  profile: BabyProfilePayload,
): Promise<any> {
  return request<any>(
    '/babies/profile',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    },
  );
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
 * Existing login/register APIs
 */
export function registerBaby(
  profile: BabyProfilePayload,
): Promise<BabyAuthResponse> {
  return request<BabyAuthResponse>(
    '/babies/register',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    },
  );
}

export function loginBaby(
  infantId: string,
  password: string,
): Promise<BabyAuthResponse> {
  return request<BabyAuthResponse>(
    '/babies/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        infant_id: infantId,
        password,
      }),
    },
  );
}
export function submitReading(
  reading: NeonatalReadingPayload,
): Promise<MonitoringResponse> {
  return request<MonitoringResponse>(
    '/monitoring/readings',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reading),
    },
  );
}
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
 * User Authentication
 */
export function loginUser(
  username: string,
  password: string,
): Promise<any> {
  return request<any>(
    '/users/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );
}

export function createFeedingLog(log: FeedingLogPayload): Promise<FeedingLog> {
  return request<FeedingLog>('/feeding-logs', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(log),
  });
}

export function getFeedingLogs(infantId: string): Promise<FeedingLog[]> {
  return request<FeedingLog[]>(`/feeding-logs/${encodeURIComponent(infantId)}`);
}

export function updateFeedingLog(
  infantId: string,
  logDate: string,
  values: Omit<FeedingLogPayload, 'infant_id' | 'log_date'>,
): Promise<FeedingLog> {
  return request<FeedingLog>(
    `/feeding-logs/${encodeURIComponent(infantId)}/${encodeURIComponent(logDate)}`,
    {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(values),
    },
  );
}
