import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD ?? undefined,
      db: parseInt(process.env.REDIS_DB ?? '0', 10),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    client.on('error', (err) => {
      console.error('[redis] connection error:', err.message);
    });

    client.on('connect', () => {
      console.log('[redis] connected');
    });
  }
  return client;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedisClient();
  await redis.connect().catch((err) => {
    console.warn('[redis] could not connect, falling back to in-memory cache:', err.message);
  });
}

// Typed cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await getRedisClient().get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, data: T, ttlSec = 60): Promise<void> {
  try {
    await getRedisClient().setex(key, ttlSec, JSON.stringify(data));
  } catch {
    // silently degrade
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    await getRedisClient().del(key);
  } catch {
    // silently degrade
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const keys = await getRedisClient().keys(pattern);
    if (keys.length > 0) await getRedisClient().del(...keys);
  } catch {
    // silently degrade
  }
}
