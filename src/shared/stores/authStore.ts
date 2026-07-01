import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'super_admin' | 'admin';

export interface AuthUser {
  email: string;
  name?: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
  role: UserRole;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  /** Persist a full session (called by the login flow). */
  login: (session: AuthSession) => void;
  /** Clear the session (logout / 401). */
  logout: () => void;
  /** Set/refresh the token and re-derive the role from its JWT payload. */
  setToken: (token: string) => void;
}

interface JwtPayload {
  role?: UserRole;
  email?: string;
  name?: string;
}

function decodeRole(token: string, fallback: UserRole | null): UserRole | null {
  try {
    return jwtDecode<JwtPayload>(token).role ?? fallback;
  } catch {
    return fallback;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      role: null,
      isAuthenticated: false,
      login: (session) =>
        set({
          accessToken: session.accessToken,
          user: session.user,
          role: session.role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({ accessToken: null, user: null, role: null, isAuthenticated: false }),
      setToken: (token) =>
        set((state) => ({
          accessToken: token,
          role: decodeRole(token, state.role),
          isAuthenticated: true,
        })),
    }),
    { name: 'bplay-admin-auth' },
  ),
);

// Selector hooks — components subscribe to a single slice, never the whole store.
export const useAccessToken = (): string | null => useAuthStore((s) => s.accessToken);
export const useAuthUser = (): AuthUser | null => useAuthStore((s) => s.user);
export const useAuthRole = (): UserRole | null => useAuthStore((s) => s.role);
export const useIsAuthenticated = (): boolean => useAuthStore((s) => s.isAuthenticated);
