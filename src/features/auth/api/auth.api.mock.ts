import { mockDelay } from '@shared/lib/mock';
import type { AuthSession, ForgotInput, LoginInput, ResetInput, UserRole } from './auth.types';

/** Mock implementation — any credentials sign you in as a super admin. */
export async function login(input: LoginInput): Promise<AuthSession> {
  await mockDelay();
  const role: UserRole = 'super_admin';
  return {
    accessToken: 'mock.access.token',
    role,
    user: { email: input.email, name: 'Super Admin', role },
  };
}

export async function logout(): Promise<void> {
  await mockDelay(200);
}

export async function forgotPassword(_input: ForgotInput): Promise<void> {
  await mockDelay();
}

export async function resetPassword(_input: ResetInput): Promise<void> {
  await mockDelay();
}
