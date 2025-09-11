import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { logger } from "@albion-raid-manager/core/logger";

type CacheOptions<T> = {
  cacheDir?: string;
  debug?: boolean;
  ignoreCache?: (value: T) => boolean;
};

const DEFAULT_CACHE_DIR = path.resolve(".cache");

function hashData(input: unknown): string {
  const json = JSON.stringify(input);
  return crypto.createHash("sha256").update(json).digest("hex");
}

async function getCacheFilePath(key: string, customDir?: string): Promise<string> {
  const dir = customDir ?? DEFAULT_CACHE_DIR;
  await fs.mkdir(dir, { recursive: true });
  return path.join(dir, `${key}.hash`);
}

export async function runIfChanged<T>(
  key: string,
  input: unknown,
  fn: () => Promise<T>,
  { cacheDir, ignoreCache, debug }: CacheOptions<T> = {},
): Promise<T | null> {
  const hashFile = await getCacheFilePath(key, cacheDir);
  const currentHash = hashData(input);

  let previousHash: string | null = null;
  try {
    previousHash = await fs.readFile(hashFile, "utf8");
  } catch {
    // no-op: file might not exist yet
  }

  if (previousHash === currentHash) {
    if (debug)
      logger.debug(`[runIfChanged] Cache hit: ${key}. Skip run.`, {
        hashFile,
        currentHash,
      });
    return null;
  }

  const result = await fn();
  if (ignoreCache && ignoreCache(result)) {
    if (debug) logger.debug(`[runIfChanged] Cache miss: ${key}. Run and ignore cache.`);
    return result;
  }

  await fs.writeFile(hashFile, currentHash, "utf8");
  if (debug) logger.debug(`[runIfChanged] Cache miss: ${key}. Run and save.`);

  return result;
}
