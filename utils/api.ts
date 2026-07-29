import { supabase } from './supabase';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Array<{ field: string; issue: string }>;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
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
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(endpoint: string, options: any = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const token = options.token || (await getAccessToken());
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    let errorPayload: any = null;
    try { errorPayload = await response.json(); } catch {}
    throw new ApiError(errorPayload?.error?.message || 'Unauthorized session.', 'UNAUTHORIZED', 401);
  }

  let json: any;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) throw new ApiError(`HTTP Error ${response.status}`, 'HTTP_ERROR', response.status);
    return {} as T;
  }

  if (!response.ok || json?.success === false) {
    const errorData = json?.error;
    throw new ApiError(
      errorData?.message || json?.message || `API request failed: ${response.status}`,
      errorData?.code || `HTTP_${response.status}`,
      response.status,
      errorData?.details
    );
  }

  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: any) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: any) => apiFetch<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any, options?: any) => apiFetch<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string, options?: any) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
