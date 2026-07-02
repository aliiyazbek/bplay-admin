import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export type UserRole = 'super_admin' | 'admin';

export interface AuthUser {
  email: string;
  name?: string;
  role: UserRole;
  /** Data URL or remote URL of the profile photo; undefined = initials fallback. */
  avatarUrl?: string;
  /** Scope-region ids for regional admins; empty/undefined admin = general oversight. */
  assignedRegionIds?: string[];
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
  /** Patch the current user's editable profile fields (name / avatar). */
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'avatarUrl'>>) => void;
}

interface JwtPayload {
  role?: UserRole;
  email?: string;
  name?: string;
  assignedRegionIds?: string[];
}

function decodePayload(token: string): JwtPayload {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return {};
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
        set((state) => {
          const payload = decodePayload(token);
          return {
            accessToken: token,
            role: payload.role ?? state.role,
            user: state.user
              ? {
                  ...state.user,
                  assignedRegionIds: payload.assignedRegionIds ?? state.user.assignedRegionIds,
                }
              : state.user,
            isAuthenticated: true,
          };
        }),
      updateProfile: (patch) =>
        set((state) => (state.user ? { user: { ...state.user, ...patch } } : {})),
    }),
    { name: 'bplay-admin-auth' },
  ),
);

// Selector hooks — components subscribe to a single slice, never the whole store.
export const useAccessToken = (): string | null => useAuthStore((s) => s.accessToken);
export const useAuthUser = (): AuthUser | null => useAuthStore((s) => s.user);
export const useAuthRole = (): UserRole | null => useAuthStore((s) => s.role);
export const useIsAuthenticated = (): boolean => useAuthStore((s) => s.isAuthenticated);
export const useAssignedRegionIds = (): string[] | undefined =>
  useAuthStore((s) => s.user?.assignedRegionIds);
