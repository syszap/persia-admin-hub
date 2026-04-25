export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'APPROVE' | 'REJECT' | 'EXPORT';

export interface AuditLog {
  id: string;
  userId?: string;
  username?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
