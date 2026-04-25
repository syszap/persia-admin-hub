// ─── Roles ───────────────────────────────────────────────────────────────────
export type UserRole =
  | 'owner'
  | 'admin'
  | 'finance_manager'
  | 'product_manager'
  | 'user'
  | 'customer';

// ─── Permissions ─────────────────────────────────────────────────────────────
export type Permission =
  | 'user.view' | 'user.create' | 'user.update' | 'user.delete'
  | 'role.view' | 'role.create' | 'role.update' | 'role.delete'
  | 'menu.view' | 'menu.create' | 'menu.update' | 'menu.delete'
  | 'report.view' | 'report.export'
  | 'cheque.view' | 'cheque.export' | 'cheque.refund'
  | 'settings.view' | 'settings.update'
  | 'audit.view'
  | 'financial.view' | 'financial.create' | 'financial.update' | 'financial.delete' | 'financial.approve'
  | 'account.view' | 'account.create' | 'account.update' | 'account.delete'
  | 'product.view' | 'product.create' | 'product.update' | 'product.delete'
  | 'order.view' | 'order.create' | 'order.update' | 'order.delete' | 'order.approve'
  | 'customer.view' | 'customer.create' | 'customer.update' | 'customer.delete';

// ─── Auth entities ────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  isActive: boolean;
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

// ─── RBAC weight table ────────────────────────────────────────────────────────
export const ROLE_WEIGHT: Record<UserRole, number> = {
  owner: 100,
  admin: 90,
  finance_manager: 70,
  product_manager: 60,
  user: 30,
  customer: 10,
};

// ─── Role display labels ──────────────────────────────────────────────────────
export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'مالک',
  admin: 'مدیر',
  finance_manager: 'مدیر مالی',
  product_manager: 'مدیر محصول',
  user: 'کاربر',
  customer: 'مشتری',
};

// ─── Default permissions per role ────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'user.view', 'user.create', 'user.update', 'user.delete',
    'role.view', 'role.create', 'role.update', 'role.delete',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'report.view', 'report.export',
    'cheque.view', 'cheque.export', 'cheque.refund',
    'settings.view', 'settings.update',
    'audit.view',
    'financial.view', 'financial.create', 'financial.update', 'financial.delete', 'financial.approve',
    'account.view', 'account.create', 'account.update', 'account.delete',
    'product.view', 'product.create', 'product.update', 'product.delete',
    'order.view', 'order.create', 'order.update', 'order.delete', 'order.approve',
    'customer.view', 'customer.create', 'customer.update', 'customer.delete',
  ],
  admin: [
    'user.view', 'user.create', 'user.update', 'user.delete',
    'role.view', 'role.create', 'role.update',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'report.view', 'report.export',
    'cheque.view', 'cheque.export', 'cheque.refund',
    'settings.view', 'settings.update',
    'audit.view',
    'financial.view', 'financial.create', 'financial.update', 'financial.approve',
    'account.view', 'account.create', 'account.update',
    'product.view', 'product.create', 'product.update', 'product.delete',
    'order.view', 'order.create', 'order.update', 'order.approve',
    'customer.view', 'customer.create', 'customer.update',
  ],
  finance_manager: [
    'report.view', 'report.export',
    'cheque.view', 'cheque.export', 'cheque.refund',
    'financial.view', 'financial.create', 'financial.update',
    'account.view', 'account.create',
    'order.view',
    'customer.view',
  ],
  product_manager: [
    'product.view', 'product.create', 'product.update', 'product.delete',
    'order.view', 'order.create', 'order.update',
    'customer.view', 'customer.create', 'customer.update',
    'report.view',
  ],
  user: [
    'menu.view', 'report.view', 'cheque.view',
    'product.view', 'order.view', 'customer.view',
  ],
  customer: ['order.view', 'product.view'],
};
