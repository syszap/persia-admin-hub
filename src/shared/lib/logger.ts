type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

type Transport = (entry: LogEntry) => void;

// Remote transport registry — populated at app startup (e.g. Sentry, DataDog)
const transports: Transport[] = [];

// Single-use session ID for correlating log entries
const SESSION_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function getUserId(): string | undefined {
  try {
    // Lazy: avoid circular dep with auth store
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { state?: { user?: { id?: string } } };
    return parsed?.state?.user?.id;
  } catch {
    return undefined;
  }
}

function emit(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
    sessionId: SESSION_ID,
  };

  // Console output in dev, or always for warn/error
  if (import.meta.env.DEV || level === 'warn' || level === 'error') {
    const fn = { debug: console.debug, info: console.info, warn: console.warn, error: console.error }[level];
    fn(`[${level.toUpperCase()}] ${message}`, ...(data !== undefined ? [data] : []));
  }

  // Remote transports (Sentry, DataDog custom endpoint, etc.)
  for (const transport of transports) {
    try {
      transport(entry);
    } catch {
      // Transports must never crash the app
    }
  }
}

export const logger = {
  debug: (message: string, data?: unknown) => emit('debug', message, data),
  info: (message: string, data?: unknown) => emit('info', message, data),
  warn: (message: string, data?: unknown) => emit('warn', message, data),
  error: (message: string, data?: unknown) => emit('error', message, data),

  /** Register a remote transport at app startup. */
  addTransport: (transport: Transport): void => {
    transports.push(transport);
  },
};
