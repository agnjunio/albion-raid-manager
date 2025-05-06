export function getBool(value?: string, defaultValue?: boolean) {
  return value === undefined ? defaultValue : /^(on|true|1)$/i.test(value);
}

export function getNumber(value?: string, defaultValue?: number) {
  const n = Number(value);
  return isNaN(n) ? defaultValue : n;
}
