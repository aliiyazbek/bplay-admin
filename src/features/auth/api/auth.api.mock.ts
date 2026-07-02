import { mockDelay } from '@shared/lib/mock';
import type { AuthSession, ForgotInput, LoginInput, ResetInput, UserRole } from './auth.types';

/** Demo regional/oversight accounts — matched case-insensitively before the default branch. */
interface DemoAccount {
  email: string;
  role: UserRole;
  name: string;
  assignedRegionIds: string[];
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'regional@bplay.app', role: 'admin', name: 'Regional Admin — Damascus', assignedRegionIds: ['c1'] },
  { email: 'regional.aleppo@bplay.app', role: 'admin', name: 'Regional Admin — Aleppo', assignedRegionIds: ['c2'] },
  { email: 'oversight@bplay.app', role: 'admin', name: 'General Oversight Admin', assignedRegionIds: [] },
];

/** Mock implementation — demo accounts sign in as admins; anything else is a super admin. */
export async function login(input: LoginInput): Promise<AuthSession> {
  await mockDelay();
  const email = input.email.trim().toLowerCase();
  const demo = DEMO_ACCOUNTS.find((account) => account.email === email);
  if (demo) {
    return {
      accessToken: 'mock.access.token',
      role: demo.role,
      user: {
        email: demo.email,
        name: demo.name,
        role: demo.role,
        assignedRegionIds: demo.assignedRegionIds,
      },
    };
  }
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
