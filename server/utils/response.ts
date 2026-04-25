import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>): void {
  res.status(statusCode).json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function sendError(res: Response, message: string, statusCode = 400, error?: string): void {
  res.status(statusCode).json({ success: false, error: error ?? message, message });
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  total: number,
  page: number,
  limit: number,
): void {
  const totalPages = Math.ceil(total / limit);
  res.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
}
