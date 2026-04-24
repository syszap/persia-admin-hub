// ─── Roles (coarse-grained, kept for backward compat) ────────────────────────
export type UserRole = 'admin' | 'moderator' | 'user';

// ─── Permissions (fine-grained, domain.action) ───────────────────────────────
export type Permission =
  // Users
  | 'user.view'
  | 'user.create'
  | 'user.update'
  | 'user.delete'
  // Roles
  | 'role.view'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  // Menus
  | 'menu.view'
  | 'menu.create'
  | 'menu.update'
  | 'menu.delete'
  // Reports
  | 'report.view'
  | 'report.export'
  // Cheques
  | 'cheque.view'
  | 'cheque.export'
  | 'cheque.refund'
  // Settings
  | 'settings.view'
  | 'settings.update'
  // Audit
  | 'audit.view';

// ─── Auth entities ────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  /** Explicit permission grants returned by the backend (override role defaults) */
  permissions?: Permission[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  user?: AuthUser;
}

// ─── RBAC weight table (kept for backward compat with hasRole()) ─────────────
export const ROLE_WEIGHT: Record<UserRole, number> = {
  admin: 100,
  moderator: 50,
  user: 10,
};

// ─── Default permission set per role (seed; backend explicit grants override) ─
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'user.view', 'user.create', 'user.update', 'user.delete',
    'role.view', 'role.create', 'role.update', 'role.delete',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'report.view', 'report.export',
    'cheque.view', 'cheque.export', 'cheque.refund',
    'settings.view', 'settings.update',
    'audit.view',
  ],
  moderator: [
    'user.view',
    'menu.view', 'menu.create', 'menu.update',
    'report.view', 'report.export',
    'cheque.view', 'cheque.export',
    'settings.view',
  ],
  user: [
    'menu.view',
    'report.view',
    'cheque.view',
  ],
};
