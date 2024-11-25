export function clone(obj: object) {
  return JSON.parse(JSON.stringify(obj));
}

export function isObject(obj: unknown): boolean {
  return !!obj && typeof obj === "object" && !Array.isArray(obj);
}

export function mergeObjects(target: Record<string, unknown>, ...sources: Record<string, unknown>[]) {
  if (!sources.length) return target;

  const source = sources.shift();
  if (!source) return target;

  for (const key in source) {
    if (isObject(target) && isObject(source)) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      // Recursively merge nested objects
      target[key] = mergeObjects(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      // Directly assign non-object properties
      target[key] = source[key];
    }
  }

  return mergeObjects(target, ...sources);
}
