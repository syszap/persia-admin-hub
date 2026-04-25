import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from './response';

export function validate(schema: z.ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const msg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      sendError(res, msg, 422, 'VALIDATION_ERROR');
      return;
    }
    req[source] = result.data;
    next();
  };
}

// ─── Common schemas ───────────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const uuidSchema = z.object({
  id: z.string().uuid(),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createUserSchema = z.object({
  username: z.string().min(3).max(100),
  password: z.string().min(8).max(200),
  email: z.string().email().optional(),
  fullName: z.string().max(200).optional(),
  role: z.enum(['owner', 'admin', 'finance_manager', 'product_manager', 'user', 'customer']),
  permissions: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().max(200).optional(),
  role: z.enum(['owner', 'admin', 'finance_manager', 'product_manager', 'user', 'customer']).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

export const createAccountSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameFa: z.string().min(1).max(200),
  type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  parentId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const createTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(500),
  entries: z.array(z.object({
    accountId: z.string().uuid(),
    entryType: z.enum(['debit', 'credit']),
    amount: z.number().positive(),
    description: z.string().optional(),
  })).min(2).refine(
    (entries) => {
      const debit = entries.filter(e => e.entryType === 'debit').reduce((s, e) => s + e.amount, 0);
      const credit = entries.filter(e => e.entryType === 'credit').reduce((s, e) => s + e.amount, 0);
      return Math.abs(debit - credit) < 0.01;
    },
    { message: 'Total debits must equal total credits (double-entry principle)' },
  ),
});

export const createProductSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  nameFa: z.string().min(1).max(200),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  unit: z.string().min(1).max(20),
  minStockLevel: z.number().int().nonnegative().default(0),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  nameFa: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  parentId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    discount: z.number().min(0).max(100).default(0),
  })).min(1),
});

export const createCustomerSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().nonnegative().default(0),
});
