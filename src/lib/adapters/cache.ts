// Shared in-memory cache for adapter responses (5 min TTL).
// Ported from WindsorClient (src/lib/windsor.ts) behavior.
// Persists across requests in the same Node process. Cleared on deploy/restart.

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  store.clear();
}

export function buildCacheKey(parts: (string | undefined)[]): string {
  return parts.map((p) => p ?? "_").join(":");
}
