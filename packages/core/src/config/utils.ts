import { readFileSync } from "fs";
import { join } from "path";

/**
 * Reads the application name from the environment variable or package.json.
 * First checks APPLICATION env var, then reads from package.json.
 * Extracts the app name from @albion-raid-manager/{app} pattern.
 *
 * @returns The application name (e.g., "api", "bot", "web")
 * @throws Error if the application cannot be determined
 */
export const readApplication = (): string => {
  // First try to read from environment variable
  if (process.env.APPLICATION) {
    return process.env.APPLICATION;
  }

  // Try to read from package.json
  try {
    const pkgPath = join(process.cwd(), "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    // Extract application name from @albion-raid-manager/{app}
    const match = pkg.name?.match(/@albion-raid-manager\/(.+)/);
    if (match?.[1]) {
      return match[1];
    }
  } catch {
    // Fall through to error
  }

  // If we can't determine the application, throw an error
  throw new Error(
    "APPLICATION could not be determined. Set APPLICATION env var or ensure package.json has a valid name.",
  );
};
