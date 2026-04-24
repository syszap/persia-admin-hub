import { authClient } from '@/services/api/client';
import type { AuthResponse, LoginCredentials, RefreshResponse } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await authClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await authClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (): Promise<void> => {
    // Invalidate the refresh token server-side (best-effort)
    await authClient.post('/auth/logout').catch(() => undefined);
  },
};
