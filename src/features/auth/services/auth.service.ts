import axios from 'axios';
import type { AuthResponse, LoginCredentials } from '../types/auth.types';

// Auth uses a dedicated Axios instance (no auth interceptor — avoids circular deps)
const authClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await authClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },
};
