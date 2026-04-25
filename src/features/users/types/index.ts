import type { UserRole, Permission } from '@/features/auth/types/auth.types';

export type { UserRole };

export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface UpdateUserPayload {
  email?: string;
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
  permissions?: Permission[];
}
