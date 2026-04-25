import { Request, Response, NextFunction } from 'express';
import * as repo from './products.repository';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { cacheGet, cacheSet, cacheDelPattern } from '../../config/redis.config';

// ─── Categories ───────────────────────────────────────────────────────────────
export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '' } = req.query as Record<string, string>;
    const cached = await cacheGet(`categories:${search}`);
    if (cached) { sendSuccess(res, cached); return; }
    const rows = await repo.findAllCategories(search);
    await cacheSet(`categories:${search}`, rows, 120);
    sendSuccess(res, rows);
  } catch (err) { next(err); }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.createCategory(req.body);
    await cacheDelPattern('categories:*');
    sendSuccess(res, row, 201);
  } catch (err) { next(err); }
}

// ─── Products ─────────────────────────────────────────────────────────────────
export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', categoryId, page = 1, limit = 20 } = req.query as Record<string, string>;
    const { rows, total } = await repo.findAllProducts(search, categoryId, Number(page), Number(limit));
    sendPaginated(res, rows, total, Number(page), Number(limit));
  } catch (err) { next(err); }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.findProductById(req.params.id);
    if (!row) throw new AppError('Product not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.createProduct(req.body);
    sendSuccess(res, row, 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') { next(new AppError('Product code already exists', 409)); return; }
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.updateProduct(req.params.id, req.body);
    if (!row) throw new AppError('Product not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await repo.deleteProduct(req.params.id);
    if (!deleted) throw new AppError('Product not found', 404);
    sendSuccess(res, null);
  } catch (err) { next(err); }
}

export async function getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await repo.getLowStockProducts();
    sendSuccess(res, rows);
  } catch (err) { next(err); }
}

export async function addInventoryMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    const row = await repo.addInventoryMovement({ ...req.body, createdBy: user.id });
    sendSuccess(res, row, 201);
  } catch (err) { next(err); }
}
