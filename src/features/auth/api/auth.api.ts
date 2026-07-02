import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@lib/apiClient';
import { unwrap } from '@shared/types/api';
import type { AuthSession, ForgotInput, LoginInput, ResetInput, UserRole } from './auth.types';

/** Real backend implementation (used when VITE_USE_MOCKS is false). */
export async function login(input: LoginInput): Promise<AuthSession> {
  const res = await apiClient.post('/admin/login', input);
  const { accessToken } = unwrap<{ accessToken: string }>(res.data);
  const payload = jwtDecode<{ role?: UserRole; email?: string; name?: string }>(accessToken);
  const role: UserRole = payload.role ?? 'admin';
  return {
    accessToken,
    role,
    user: { email: payload.email ?? input.email, name: payload.name, role },
  };
}

export async function logout(): Promise<void> {
  await apiClient.post('/admin/logout');
}

export async function forgotPassword(input: ForgotInput): Promise<void> {
  await apiClient.post('/auth/forgot-password', input);
}

export async function resetPassword(input: ResetInput): Promise<void> {
  await apiClient.post('/auth/reset-password', input);
}
