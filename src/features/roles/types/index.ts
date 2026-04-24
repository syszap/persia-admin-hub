export const PERMISSION_COLUMNS = [
  { key: 'apps', label: 'اپلیکیشن‌ها' },
  { key: 'menus', label: 'منوها' },
  { key: 'reports', label: 'گزارشات' },
  { key: 'users', label: 'کاربران' },
  { key: 'settings', label: 'تنظیمات' },
] as const;

export type PermissionKey = (typeof PERMISSION_COLUMNS)[number]['key'];

export interface Role {
  id: string;
  name: string;
  permissions: Record<PermissionKey, boolean>;
}
