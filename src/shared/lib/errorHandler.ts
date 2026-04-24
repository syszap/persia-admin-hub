import { AxiosError } from 'axios';
import { logger } from './logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  /** Machine-readable error code */
  code: string;
  /** Raw technical message (logs only) */
  message: string;
  /** Persian user-facing message (safe to display) */
  userMessage: string;
  severity: ErrorSeverity;
  /** Original HTTP status if applicable */
  httpStatus?: number;
}

const HTTP_ERROR_MAP: Record<number, Omit<AppError, 'message' | 'httpStatus'>> = {
  400: { code: 'BAD_REQUEST',    userMessage: 'درخواست ارسالی نامعتبر است.',           severity: 'low' },
  403: { code: 'FORBIDDEN',      userMessage: 'دسترسی به این بخش مجاز نیست.',          severity: 'medium' },
  404: { code: 'NOT_FOUND',      userMessage: 'اطلاعات مورد نظر یافت نشد.',            severity: 'low' },
  409: { code: 'CONFLICT',       userMessage: 'تعارض اطلاعات. دوباره تلاش کنید.',      severity: 'medium' },
  422: { code: 'VALIDATION',     userMessage: 'اطلاعات وارد شده معتبر نیست.',          severity: 'low' },
  429: { code: 'RATE_LIMIT',     userMessage: 'درخواست‌های زیاد. کمی صبر کنید.',       severity: 'medium' },
  500: { code: 'SERVER_ERROR',   userMessage: 'خطای سرور. لطفاً بعداً تلاش کنید.',    severity: 'high' },
  502: { code: 'BAD_GATEWAY',    userMessage: 'خطای دروازه. لطفاً بعداً تلاش کنید.',  severity: 'high' },
  503: { code: 'UNAVAILABLE',    userMessage: 'سرویس موقتاً در دسترس نیست.',           severity: 'high' },
  504: { code: 'TIMEOUT',        userMessage: 'پاسخ سرور خیلی دیر رسید.',             severity: 'high' },
};

export function parseApiError(error: unknown): AppError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const serverMessage: string =
      (error.response?.data as { error?: string })?.error ?? error.message;

    if (status && HTTP_ERROR_MAP[status]) {
      return { ...HTTP_ERROR_MAP[status], message: serverMessage, httpStatus: status };
    }

    // Network-level failure (no response)
    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        userMessage: 'اتصال به سرور برقرار نشد. اینترنت خود را بررسی کنید.',
        severity: 'high',
      };
    }
  }

  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : String(error),
    userMessage: 'خطای غیرمنتظره‌ای رخ داد.',
    severity: 'critical',
  };
}

/** Parses the error and ships it to the logger. Returns the AppError for callers. */
export function handleApiError(error: unknown, context?: string): AppError {
  const appError = parseApiError(error);

  logger.error(`[API] ${context ? `${context}: ` : ''}${appError.code} — ${appError.message}`, {
    code: appError.code,
    severity: appError.severity,
    httpStatus: appError.httpStatus,
  });

  return appError;
}

/** Returns true for errors that should NOT trigger a retry. */
export function isNonRetryableError(error: unknown): boolean {
  const appError = parseApiError(error);
  return ['BAD_REQUEST', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION', 'CONFLICT'].includes(
    appError.code,
  );
}
