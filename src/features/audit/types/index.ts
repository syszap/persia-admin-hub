/** All trackable user actions in the system (domain.verb pattern). */
export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'role.updated'
  | 'menu.created'
  | 'menu.updated'
  | 'menu.deleted'
  | 'cheque.exported'
  | 'cheque.refunded'
  | 'settings.updated';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actorUsername: string;
  timestamp: string;
  /** Affected resource type (e.g. "user", "role") */
  resource?: string;
  /** Affected resource primary key */
  resourceId?: string;
  /** State snapshot before the mutation */
  before?: unknown;
  /** State snapshot after the mutation */
  after?: unknown;
  /** Free-form metadata */
  meta?: Record<string, unknown>;
}

export interface AuditLogInput {
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  before?: unknown;
  after?: unknown;
  meta?: Record<string, unknown>;
}
