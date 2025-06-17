import { logger } from "@albion-raid-manager/logger";

type CacheData = {
  value: unknown;
  expires?: number;
  timeoutId?: NodeJS.Timeout;
  intervalId?: NodeJS.Timeout;
};

type CacheOptions = {
  timeout?: number;
  refresh?: number;
  debug?: boolean;
  ignoreCache?: (value: unknown) => boolean;
  onTimeout?: (key: string, value: unknown) => void;
  onExpire?: (key: string, _value: unknown) => void;
  onDelete?: (_key: string, _value: unknown) => void;
};

const cache = new Map(); // In-memory cache using Map

export function remove(key: string) {
  if (cache.has(key)) {
    const data = cache.get(key);
    if (data.timeoutId) clearTimeout(data.timeoutId);
    if (data.intervalId) clearInterval(data.intervalId);
  }

  return cache.delete(key);
}

export function get(key: string, { debug = false }: { debug?: boolean }) {
  if (!cache.has(key)) {
    if (debug) logger.verbose(`Cache miss: ${key}. Cache size: ${cache.size}`);
    return null;
  }

  const data = cache.get(key);
  if (data.expires && data.expires < Date.now()) {
    remove(key);
    if (debug) logger.verbose(`Cache expired: ${key}. Cache size: ${cache.size}`);
    return null;
  }

  if (debug) logger.verbose(`Cache hit: ${key}. Cache size: ${cache.size}`);
  return data.value;
}

export function set(key: string, value: unknown, { timeout, onTimeout, debug = false, ignoreCache }: CacheOptions) {
  // Don't cache if the callback is true
  if (ignoreCache && ignoreCache(value)) return value;

  if (timeout && typeof timeout !== "number") throw new Error("Timeout for cache must be a valid number.");
  if (onTimeout && typeof onTimeout !== "function")
    throw new Error("Timeout callback for cache must be a valid function.");

  // Delete old entry
  if (cache.has(key)) {
    remove(key);
  }

  const data: CacheData = {
    value,
  };

  if (timeout) {
    data.expires = Date.now() + timeout;
    data.timeoutId = setTimeout(() => {
      remove(key);
      if (onTimeout) onTimeout(key, value);
    }, timeout);
  }

  cache.set(key, data);
  if (debug) logger.verbose(`Cache set: ${key}. Cache size: ${cache.size}`);

  return value;
}

export async function memoize<T>(
  key: string,
  fn: () => T | Promise<T>,
  { timeout, onTimeout, debug, ignoreCache, refresh }: CacheOptions,
) {
  if (timeout && typeof timeout !== "number") throw new Error("Cache 'timeout' option must be a valid number.");
  if (refresh && typeof refresh !== "number") throw new Error("Cache 'refresh' option must be a valid number.");
  if (onTimeout && typeof onTimeout !== "function") throw new Error("Cache 'onTimeout' must be a valid function.");

  // 1. In-memory check
  let value: T = get(key, { debug });
  if (value) return value;

  // 2. Generate value
  value = await fn();
  set(key, value, { timeout, onTimeout, debug, ignoreCache });

  // 3. Refresh logic
  if (refresh) {
    const data = cache.get(key);

    if (data.intervalId) clearInterval(data.intervalId);
    data.intervalId = setInterval(async () => {
      data.value = await fn();
      cache.set(key, data);
      if (debug) logger.verbose(`Cache refresh: ${key}. Cache size: ${cache.size}`);
    }, refresh);

    cache.set(key, data);
  }
  return value;
}

export function size() {
  return cache.size;
}
