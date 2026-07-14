import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@shared/stores/authStore';
import { toAppError } from './errors';

/** The single axios instance. Base URL comes from the environment, never hardcoded. */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  // Fail fast instead of hanging forever if the backend stalls (axios default is no timeout).
  timeout: 15_000,
});

// Request: attach the Bearer token from the auth store (not a raw localStorage read).
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: normalize every error to AppError; on 401, drop the session and bounce to login.
// TODO(auth): when the backend exposes POST /auth/refresh, attempt a silent refresh before logout.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const appError = toAppError(error);
    if (appError.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(appError);
  },
);
