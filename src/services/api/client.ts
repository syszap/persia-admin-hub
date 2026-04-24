import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { acquireRefreshLock, getIsRefreshing, waitForRefresh } from './tokenManager';

// ─── Auth client (no interceptors — avoids recursive refresh loops) ───────────
export const authClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
  withCredentials: true, // send cookies (HttpOnly refresh token if backend supports it)
});

// ─── Main API client ──────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  withCredentials: true,
});

// ─── Request: inject in-memory access token ───────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Lazy import breaks the circular dep: client → store → (types only)
  // auth.store never imports from client, so this is safe at runtime.
  const { useAuthStore } = require('@/features/auth/store/auth.store') as typeof import('@/features/auth/store/auth.store');
  const token = useAuthStore.getState().token;

  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // CSRF double-submit: echo server-issued csrf-token cookie back as a header.
  // Backend must set a non-HttpOnly cookie named "csrf-token".
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf-token='))
    ?.split('=')[1];
  if (csrfToken && config.headers) {
    config.headers['X-CSRF-Token'] = decodeURIComponent(csrfToken);
  }

  return config;
});

// ─── Response: silent token refresh on 401 ───────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401 and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { useAuthStore } = require('@/features/auth/store/auth.store') as typeof import('@/features/auth/store/auth.store');
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

    // No refresh token means the session is truly expired
    if (!refreshToken) {
      logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Another refresh is already in flight — queue this request
    if (getIsRefreshing()) {
      try {
        const newToken = await waitForRefresh();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    // Acquire the refresh lock and perform the refresh
    try {
      const result = await acquireRefreshLock(
        () =>
          authClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
            refreshToken,
          }).then((r) => r.data),
        ({ token, refreshToken: newRefresh }) => {
          setAccessToken(token, newRefresh);
        },
        () => {
          logout();
          window.location.href = '/login';
        },
      );

      originalRequest.headers['Authorization'] = `Bearer ${result.token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export type ApiError = AxiosError<{ error: string; code?: string }>;
