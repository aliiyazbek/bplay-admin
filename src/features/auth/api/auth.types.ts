import type { AuthSession, UserRole } from '@shared/stores/authStore';

export type { AuthSession, UserRole };

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotInput {
  email: string;
}

export interface ResetInput {
  token: string;
  password: string;
}
