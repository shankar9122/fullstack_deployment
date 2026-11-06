import { env } from '@/config/env';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { ApiError } from './errors';

type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  /** Set to false for public endpoints such as login: no token is sent and a 401 is not treated as an expired session */
  auth?: boolean;
}

// The auth layer registers a callback here. This keeps the HTTP client free of React and routing
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`/api${path}`, env.apiUrl);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  { params, body, signal, auth = true }: RequestOptions = {},
): Promise<T> {
  const token = auth ? tokenStorage.get() : null;

  // 2. FormData is sent as is. The browser adds "multipart/form-data; boundary=..." itself
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;

  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    // Network down or blocked by CORS: fetch throws here
    throw new ApiError('Cannot reach the server. Check your connection or CORS settings.', 0);
  }

  const data = await res.json().catch(() => null);

  // fetch does not reject on 4xx/5xx, so check the status ourselves
  if (!res.ok) {
    // Only react if the token we sent is still the current one. Otherwise this is a late response
    // from before a new login (or after logout), and it must not log the user out again
    if (res.status === 401 && token && tokenStorage.get() === token) {
      unauthorizedHandler?.();
    }
    throw new ApiError(data?.message ?? `Request failed (${res.status})`, res.status, data?.errors);
  }

  return data as T;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>('POST', path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>('PUT', path, options),
  patch: <T>(path: string, options?: RequestOptions) => request<T>('PATCH', path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
