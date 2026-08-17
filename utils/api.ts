import { supabase } from './supabase';

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
  timestamp?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Array<{ field: string; issue: string }>;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    status: number = 500,
    details?: Array<{ field: string; issue: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface ApiOptions extends RequestInit {
  token?: string;
  headers?: Record<string, string>;
}

const getBaseUrl = (): string => {
  return (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api/v1').replace(/\/$/, '');
};

async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
    const { data: { session: refreshed } } = await supabase.auth.refreshSession();
    return refreshed?.access_token || null;
  } catch (err) {
    console.warn('[API Wrapper] Failed to retrieve Supabase session token:', err);
    return null;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const token = options.token || (await getAccessToken());
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Inject X-Timezone header
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      headers['X-Timezone'] = timezone;
    }
  } catch (e) {
    console.warn('[API Client] Failed to resolve timezone:', e);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const { token: _, ...fetchOptions } = options;

  const config: RequestInit = {
    ...fetchOptions,
    headers,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    let errorPayload: any = null;
    try {
      errorPayload = await response.json();
    } catch {
      // ignore
    }
    const message =
      errorPayload?.error?.message || 'Unauthorized session. Please log in again.';
    const code = errorPayload?.error?.code || 'UNAUTHORIZED';
    const details = errorPayload?.error?.details;
    throw new ApiError(message, code, 401, details);
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `HTTP Error ${response.status}: ${response.statusText}`,
        'HTTP_ERROR',
        response.status
      );
    }
    return {} as T;
  }

  if (!response.ok || (json && json.success === false)) {
    const errorData = json?.error;
    const message =
      errorData?.message || json?.message || `API request failed with status ${response.status}`;
    const code = errorData?.code || `HTTP_${response.status}`;
    const details = errorData?.details;
    throw new ApiError(message, code, response.status, details);
  }

  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: ApiOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
