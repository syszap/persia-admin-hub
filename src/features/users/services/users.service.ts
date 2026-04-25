import { apiClient } from '@/services/api/client';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types';

const BASE = '/users';

export const usersService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await apiClient.get(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<{ data: User }>(`${BASE}/${id}`);
    return data.data;
  },

  create: async (payload: CreateUserPayload) => {
    const { data } = await apiClient.post(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await apiClient.patch(`${BASE}/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
