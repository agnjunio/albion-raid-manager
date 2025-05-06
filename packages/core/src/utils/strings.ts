export function printSpace(count: number) {
  return " ".repeat(Math.max(count, 0));
}

export function equalsCaseInsensitive(a: string, b: string) {
  return a && a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;
}

export function toHiphenLowerCase(text: string) {
  return text.toLowerCase().replace(/ /g, "-");
}
