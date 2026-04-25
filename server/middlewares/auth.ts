import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/app.config';
import type { UserRole, Permission } from '../../packages/shared/src/types/auth';
import { ROLE_PERMISSIONS } from '../../packages/shared/src/types/auth';

export interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  permissions?: Permission[];
  tenantId?: string;
  exp: number;
  iat: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  tenantId?: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    (req as AuthenticatedRequest).user = payload;
    (req as AuthenticatedRequest).tenantId = payload.tenantId;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requirePermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const rolePerms = ROLE_PERMISSIONS[user.role] ?? [];
    const userPerms = user.permissions ?? [];
    const effective = new Set([...rolePerms, ...userPerms]);

    const hasAll = permissions.every((p) => effective.has(p));
    if (!hasAll) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient role' });
      return;
    }
    next();
  };
}
