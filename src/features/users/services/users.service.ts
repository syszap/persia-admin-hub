import { apiClient } from '@/services/api/client';
import type { User, CreateUserPayload } from '../types';

const BASE = '/users';

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>(BASE);
    return data;
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await apiClient.post<User>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: Partial<CreateUserPayload>): Promise<User> => {
    const { data } = await apiClient.put<User>(`${BASE}/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
