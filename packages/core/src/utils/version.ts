import { readFileSync } from "node:fs";
import { join } from "node:path";

export function readVersion(packageJsonPath?: string): string {
  try {
    const path = packageJsonPath || join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(readFileSync(path, "utf-8"));
    return packageJson.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}
