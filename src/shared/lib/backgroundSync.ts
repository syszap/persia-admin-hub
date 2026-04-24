/**
 * Background sync queue for mutations that fail while offline.
 *
 * When a write request fails due to a network error, enqueue it here.
 * The service worker will receive a 'bg-mutation-sync' sync event when
 * connectivity is restored and re-attempt the requests via this module.
 *
 * Storage: localStorage (survives page refresh, accessible to SW via postMessage).
 */

const QUEUE_KEY = 'bg-sync-queue';
const SW_SYNC_TAG = 'bg-mutation-sync';

interface SyncRequest {
  id: string;
  url: string;
  method: string;
  body: string | null;
  headers: Record<string, string>;
  timestamp: number;
}

function readQueue(): SyncRequest[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as SyncRequest[];
  } catch {
    return [];
  }
}

function writeQueue(queue: SyncRequest[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export const backgroundSync = {
  /**
   * Enqueue a failed mutation for later retry.
   * Also registers the background-sync tag with the service worker.
   */
  enqueue: async (request: Omit<SyncRequest, 'id' | 'timestamp'>): Promise<void> => {
    const queue = readQueue();
    queue.push({ ...request, id: crypto.randomUUID(), timestamp: Date.now() });
    writeQueue(queue);

    // Register with the service worker so the OS can wake us up when online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register(
          SW_SYNC_TAG,
        );
      } catch {
        // Background Sync API not supported in all browsers — graceful degradation
      }
    }
  },

  /** Drain the queue and attempt to replay each request. */
  replay: async (): Promise<void> => {
    const queue = readQueue();
    if (!queue.length) return;

    const remaining: SyncRequest[] = [];

    for (const req of queue) {
      try {
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
          credentials: 'include',
        });
      } catch {
        remaining.push(req);
      }
    }

    writeQueue(remaining);
  },

  getQueue: readQueue,

  remove: (id: string): void => {
    writeQueue(readQueue().filter((r) => r.id !== id));
  },
};
