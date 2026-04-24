export type UserRole = 'admin' | 'moderator' | 'user';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Maps roles to numeric tiers for RBAC comparisons
export const ROLE_WEIGHT: Record<UserRole, number> = {
  admin: 100,
  moderator: 50,
  user: 10,
};
