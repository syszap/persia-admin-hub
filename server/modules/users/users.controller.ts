import { Request, Response, NextFunction } from 'express';
import * as repo from './users.repository';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler';
import { revokeAllUserTokens } from '../auth/auth.service';

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', page = 1, limit = 20 } = req.query as Record<string, string | number>;
    const { rows, total } = await repo.findAll(String(search), Number(page), Number(limit));
    const mapped = rows.map((r) => ({
      id: r.id,
      username: r.username,
      email: r.email,
      fullName: r.full_name,
      role: r.role,
      permissions: r.permissions,
      isActive: r.is_active,
      lastLoginAt: r.last_login_at,
      createdAt: r.created_at,
    }));
    sendPaginated(res, mapped, total, Number(page), Number(limit));
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.findById(req.params.id);
    if (!row) throw new AppError('User not found', 404);
    sendSuccess(res, { id: row.id, username: row.username, email: row.email, fullName: row.full_name, role: row.role, permissions: row.permissions, isActive: row.is_active });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.create(req.body);
    sendSuccess(res, { id: row.id, username: row.username, role: row.role }, 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') {
      next(new AppError('Username or email already exists', 409));
      return;
    }
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.update(req.params.id, req.body);
    if (!row) throw new AppError('User not found', 404);
    sendSuccess(res, { id: row.id, username: row.username, role: row.role, isActive: row.is_active });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await revokeAllUserTokens(req.params.id);
    const deleted = await repo.remove(req.params.id);
    if (!deleted) throw new AppError('User not found', 404);
    sendSuccess(res, null, 200);
  } catch (err) {
    next(err);
  }
}
