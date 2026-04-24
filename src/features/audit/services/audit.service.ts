import { apiClient } from '@/services/api/client';
import { logger } from '@/shared/lib/logger';
import type { AuditEntry, AuditLogInput } from '../types';

// ─── Batching configuration ───────────────────────────────────────────────────
const FLUSH_INTERVAL_MS = 10_000;
const MAX_BATCH_SIZE    = 20;
const MAX_QUEUE_SIZE    = 200; // safety cap: prevent unbounded growth

let batch: AuditEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await flush();
  }, FLUSH_INTERVAL_MS);
}

async function flush(): Promise<void> {
  if (!batch.length) return;

  const entries = batch.splice(0, batch.length);

  try {
    await apiClient.post('/audit', { entries });
  } catch (err) {
    logger.warn('[Audit] Flush failed — re-queuing entries', { count: entries.length });
    // Re-prepend undelivered entries; cap to avoid memory leak
    batch = [...entries, ...batch].slice(0, MAX_QUEUE_SIZE);
  }
}

// Flush on page unload to avoid losing the last batch
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

export const auditService = {
  enqueue(entry: AuditEntry): void {
    if (batch.length >= MAX_QUEUE_SIZE) {
      logger.warn('[Audit] Queue full — dropping oldest entry');
      batch.shift();
    }

    batch.push(entry);
    logger.debug(`[Audit] ${entry.action}`, { resourceId: entry.resourceId });

    if (batch.length >= MAX_BATCH_SIZE) {
      // Flush immediately when the batch is large enough
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      flush();
    } else {
      scheduleFlush();
    }
  },

  /** Fetch persisted audit logs from the backend. */
  getList: async (filters?: Record<string, unknown>): Promise<AuditEntry[]> => {
    const { data } = await apiClient.get<AuditEntry[]>('/audit', { params: filters });
    return data;
  },
};

export type { AuditEntry, AuditLogInput };
