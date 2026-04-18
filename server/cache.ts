interface Entry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export function get<T>(key: string): T | null {
  const entry = store.get(key) as Entry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function set<T>(key: string, data: T, ttlMs = 60_000): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}
