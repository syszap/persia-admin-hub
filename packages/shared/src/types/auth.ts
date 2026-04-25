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
  // Users
  | 'user.view' | 'user.create' | 'user.update' | 'user.delete'
  // Roles
  | 'role.view' | 'role.create' | 'role.update' | 'role.delete'
  // Menus
  | 'menu.view' | 'menu.create' | 'menu.update' | 'menu.delete'
  // Reports
  | 'report.view' | 'report.export'
  // Cheques
  | 'cheque.view' | 'cheque.export' | 'cheque.refund'
  // Settings
  | 'settings.view' | 'settings.update'
  // Audit
  | 'audit.view'
  // Financial
  | 'financial.view' | 'financial.create' | 'financial.update' | 'financial.delete' | 'financial.approve'
  // Accounts
  | 'account.view' | 'account.create' | 'account.update' | 'account.delete'
  // Products
  | 'product.view' | 'product.create' | 'product.update' | 'product.delete'
  // Orders
  | 'order.view' | 'order.create' | 'order.update' | 'order.delete' | 'order.approve'
  // Customers
  | 'customer.view' | 'customer.create' | 'customer.update' | 'customer.delete';

// ─── RBAC weight ─────────────────────────────────────────────────────────────
export const ROLE_WEIGHT: Record<UserRole, number> = {
  owner: 100,
  admin: 90,
  finance_manager: 70,
  product_manager: 60,
  user: 30,
  customer: 10,
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
    'menu.view',
    'report.view',
    'cheque.view',
    'product.view',
    'order.view',
    'customer.view',
  ],
  customer: [
    'order.view',
    'product.view',
  ],
};

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
