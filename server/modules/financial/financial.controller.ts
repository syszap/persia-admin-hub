import { Request, Response, NextFunction } from 'express';
import * as repo from './financial.repository';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AppError } from '../../middlewares/errorHandler';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { cacheGet, cacheSet, cacheDelPattern } from '../../config/redis.config';

// ─── Accounts ────────────────────────────────────────────────────────────────
export async function listAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', page = 1, limit = 50 } = req.query as Record<string, string>;
    const cacheKey = `accounts:list:${search}:${page}:${limit}`;
    const cached = await cacheGet<{ rows: unknown[]; total: number }>(cacheKey);
    if (cached) { sendPaginated(res, cached.rows, cached.total, Number(page), Number(limit)); return; }

    const { rows, total } = await repo.findAllAccounts(search, Number(page), Number(limit));
    await cacheSet(cacheKey, { rows, total }, 60);
    sendPaginated(res, rows, total, Number(page), Number(limit));
  } catch (err) { next(err); }
}

export async function getAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.findAccountById(req.params.id);
    if (!row) throw new AppError('Account not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.createAccount(req.body);
    await cacheDelPattern('accounts:*');
    sendSuccess(res, row, 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === '23505') { next(new AppError('Account code already exists', 409)); return; }
    next(err);
  }
}

export async function updateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.updateAccount(req.params.id, req.body);
    if (!row) throw new AppError('Account not found', 404);
    await cacheDelPattern('accounts:*');
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function listTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search = '', status, page = 1, limit = 20 } = req.query as Record<string, string>;
    const { rows, total } = await repo.findAllTransactions(search, status, Number(page), Number(limit));
    sendPaginated(res, rows, total, Number(page), Number(limit));
  } catch (err) { next(err); }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.findTransactionById(req.params.id);
    if (!row) throw new AppError('Transaction not found', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    const row = await repo.createTransaction({ ...req.body, createdBy: user.id });
    sendSuccess(res, row, 201);
  } catch (err) { next(err); }
}

export async function postTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as AuthenticatedRequest).user;
    const row = await repo.postTransaction(req.params.id, user.id);
    if (!row) throw new AppError('Transaction not found or already posted', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

export async function voidTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await repo.voidTransaction(req.params.id);
    if (!row) throw new AppError('Transaction not found or not in posted state', 404);
    sendSuccess(res, row);
  } catch (err) { next(err); }
}

// ─── Ledger & Reports ─────────────────────────────────────────────────────────
export async function getAccountLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fromDate = '', toDate = '' } = req.query as Record<string, string>;
    const entries = await repo.getAccountLedger(req.params.id, fromDate, toDate);
    sendSuccess(res, entries);
  } catch (err) { next(err); }
}

export async function getTrialBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = 'financial:trial-balance';
    const cached = await cacheGet(cacheKey);
    if (cached) { sendSuccess(res, cached); return; }
    const data = await repo.getTrialBalance();
    await cacheSet(cacheKey, data, 120);
    sendSuccess(res, data);
  } catch (err) { next(err); }
}
