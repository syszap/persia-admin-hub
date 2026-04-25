import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import pool from '../postgres';
import type { AuditAction } from '../../packages/shared/src/types/audit';

export function auditLog(action: AuditAction, resource: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    const resourceId = (req.params.id as string) ?? undefined;

    pool.query(
      `INSERT INTO audit_logs (user_id, username, action, resource, resource_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        user?.id ?? null,
        user?.username ?? 'anonymous',
        action,
        resource,
        resourceId ?? null,
        req.ip,
        req.headers['user-agent'] ?? null,
      ],
    ).catch(() => { /* non-blocking */ });

    next();
  };
}
