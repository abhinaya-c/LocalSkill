import { useAuthStore } from '../store/useAuthStore';

interface ApiRequestOptions extends RequestInit {
  json?: any;
}

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// In production: VITE_API_URL = https://your-backend.onrender.com
// In development: falls back to '' so Vite proxy handles /api/*
const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  // Ensure the path has a leading slash and don't double-prefix /api
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http')
    ? path
    : `${API_BASE}${normalizedPath.startsWith('/api') ? normalizedPath : `/api${normalizedPath}`}`;

  // 1. Get current access token
  const token = useAuthStore.getState().accessToken;

  // 2. Set headers
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.json && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.json);
  }

  // Set credentials to 'include' for cookies (refresh token)
  options.credentials = 'include';
  options.headers = headers;

  let response = await fetch(url, options);

  // 3. Handle Unauthorized (Token Expired)
  if (response.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    try {
      console.log('Access token expired. Attempting token refresh...');
      // Try to refresh token
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccessToken = data.accessToken;
        
        // Save new token in store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Retry original request with new token
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        options.headers = headers;
        response = await fetch(url, options);
      } else {
        // Refresh token invalid/expired, log out user
        console.warn('Refresh token invalid. Logging user out.');
        useAuthStore.getState().logout();
        window.location.href = '/auth';
        throw new APIError('Session expired. Please log in again.', 401);
      }
    } catch (err) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
      throw err;
    }
  }

  // 4. Handle HTTP Errors
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errBody = await response.json();
      errorMessage = errBody.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new APIError(errorMessage, response.status);
  }

  // 5. Parse JSON
  if (response.status === 204) {
    return {} as T;
  }
  return response.json();
}
