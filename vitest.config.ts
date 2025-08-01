import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Automatically discover all packages and apps
    projects: ["apps/*", "packages/*"],
  },
});
