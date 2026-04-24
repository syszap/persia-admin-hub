import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, UserRole, Permission } from '../types/auth.types';
import { ROLE_PERMISSIONS, ROLE_WEIGHT } from '../types/auth.types';

interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  permissions?: Permission[];
  exp: number;
}

interface AuthState {
  // SECURITY: access token lives in Zustand memory — never written to localStorage
  token: string | null;
  // Refresh token persisted to localStorage (ideal: HttpOnly cookie set by server)
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  // Computed union of role defaults + server grants
  effectivePermissions: Permission[];

  setAuth: (token: string, refreshToken: string, user: AuthUser) => void;
  setAccessToken: (token: string, refreshToken?: string) => void;
  logout: () => void;

  // Legacy role-weight check — preserved for backward compat
  hasRole: (minRole: UserRole) => boolean;

  // Fine-grained PBAC checks
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

function resolvePermissions(user: AuthUser): Permission[] {
  const fromRole = ROLE_PERMISSIONS[user.role] ?? [];
  if (!user.permissions?.length) return fromRole;
  // Union: role defaults + explicit server grants (deduped)
  return Array.from(new Set([...fromRole, ...user.permissions]));
}

function isSessionValid(token: string | null): boolean {
  return !!token && !isTokenExpired(token);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      effectivePermissions: [],

      setAuth: (token, refreshToken, user) => {
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
          effectivePermissions: resolvePermissions(user),
        });
      },

      // Called by the silent refresh flow to swap in a new access token
      setAccessToken: (token, refreshToken) => {
        set((state) => ({
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: true,
        }));
      },

      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          effectivePermissions: [],
        });
      },

      hasRole: (minRole) => {
        const { user, token } = get();
        if (!user || !isSessionValid(token)) return false;
        return ROLE_WEIGHT[user.role] >= ROLE_WEIGHT[minRole];
      },

      hasPermission: (permission) => {
        const { effectivePermissions, token } = get();
        if (!isSessionValid(token)) return false;
        return effectivePermissions.includes(permission);
      },

      hasAnyPermission: (permissions) => {
        const { effectivePermissions, token } = get();
        if (!isSessionValid(token)) return false;
        return permissions.some((p) => effectivePermissions.includes(p));
      },

      hasAllPermissions: (permissions) => {
        const { effectivePermissions, token } = get();
        if (!isSessionValid(token)) return false;
        return permissions.every((p) => effectivePermissions.includes(p));
      },
    }),
    {
      name: 'auth-storage',
      // SECURITY: access token NEVER persisted to localStorage
      // Only refresh token + user shape survive a page reload
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.effectivePermissions = resolvePermissions(state.user);
        }
        // isAuthenticated stays false until AuthInitializer performs silent refresh
      },
    },
  ),
);
