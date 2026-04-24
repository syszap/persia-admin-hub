import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AuthUser, UserRole } from '../types/auth.types';

interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  exp: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  hasRole: (minRole: UserRole) => boolean;
}

const ROLE_WEIGHT: Record<UserRole, number> = { admin: 100, moderator: 50, user: 10 };

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },

      hasRole: (minRole) => {
        const { user, token } = get();
        if (!user || !token || isTokenExpired(token)) return false;
        return ROLE_WEIGHT[user.role] >= ROLE_WEIGHT[minRole];
      },
    }),
    {
      name: 'auth-storage',
      // Only persist token+user; rehydrate isAuthenticated from token validity
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && !isTokenExpired(state.token)) {
          state.isAuthenticated = true;
        } else if (state) {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
        }
      },
    },
  ),
);
