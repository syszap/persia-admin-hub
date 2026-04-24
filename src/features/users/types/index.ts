export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
}
