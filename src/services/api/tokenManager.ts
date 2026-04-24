/**
 * Refresh-lock mechanism.
 *
 * Problem: when N concurrent requests all receive 401, each would try to refresh
 * independently — causing N parallel /auth/refresh calls with only the first one
 * succeeding (all others invalidate the refresh token on rotation).
 *
 * Solution:
 *  • The first 401 acquires the lock and performs the refresh.
 *  • Every subsequent 401 while the lock is held enqueues a Promise.
 *  • On success: the queue is flushed with the new token → all retries proceed.
 *  • On failure: the queue is rejected → all retries propagate the error.
 */

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (reason: unknown) => void;
};

let isRefreshing = false;
let queue: QueueEntry[] = [];

function flushQueue(token: string): void {
  queue.forEach((entry) => entry.resolve(token));
  queue = [];
}

function drainQueue(reason: unknown): void {
  queue.forEach((entry) => entry.reject(reason));
  queue = [];
}

/** Returns a promise that resolves once the in-flight refresh completes. */
export function waitForRefresh(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    queue.push({ resolve, reject });
  });
}

export function getIsRefreshing(): boolean {
  return isRefreshing;
}

export async function acquireRefreshLock<T>(
  fn: () => Promise<T>,
  onSuccess: (result: T & { token: string }) => void,
  onFailure: () => void,
): Promise<T & { token: string }> {
  if (isRefreshing) {
    throw new Error('Refresh already in progress — use waitForRefresh() instead');
  }

  isRefreshing = true;

  try {
    const result = await fn();
    const typed = result as T & { token: string };
    onSuccess(typed);
    flushQueue(typed.token);
    return typed;
  } catch (error) {
    drainQueue(error);
    onFailure();
    throw error;
  } finally {
    isRefreshing = false;
  }
}
