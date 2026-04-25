import { Request, Response, NextFunction } from 'express';
import * as repo from './orders.repository';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler';
import { AuthenticatedRequest } from '../../middlewares/auth';

// ─── Customers ────────────────────────────────────────────────────────────────
export async function listCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', page = 1, limit = 20 } = req.query as Record<string, string>;
    const { rows, total } = await repo.findAllCustomers(search, Number(page), Number(limit));
    sendPaginated(res, rows, total, Number(page), Number(limit));
  } catch (err) { next(err); }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.findCustomerById(req.params.id);
    if (!row) throw new AppError('Customer not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.createCustomer(req.body);
    sendSuccess(res, row, 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') { next(new AppError('Customer code already exists', 409)); return; }
    next(err);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.updateCustomer(req.params.id, req.body);
    if (!row) throw new AppError('Customer not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', status, page = 1, limit = 20 } = req.query as Record<string, string>;
    const { rows, total } = await repo.findAllOrders(search, status, Number(page), Number(limit));
    sendPaginated(res, rows, total, Number(page), Number(limit));
  } catch (err) { next(err); }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.findOrderById(req.params.id);
    if (!row) throw new AppError('Order not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    const row = await repo.createOrder({ ...req.body, createdBy: user.id });
    sendSuccess(res, row, 201);
  } catch (err) { next(err); }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { status } = req.body as { status: string };
    const row = await repo.updateOrderStatus(req.params.id, status, user.id);
    if (!row) throw new AppError('Order not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function getOrderStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await repo.getOrderStats();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
}
