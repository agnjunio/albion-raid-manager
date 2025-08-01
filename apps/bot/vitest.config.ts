import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.{idea,git,cache,output,temp}/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*", "test/", "**/coverage/**"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./apps/bot/src"),
      "@albion-raid-manager/core": resolve(__dirname, "./packages/core/src"),
      "@albion-raid-manager/database": resolve(__dirname, "./packages/database/src"),
      "@albion-raid-manager/config": resolve(__dirname, "./packages/config/src"),
      "@albion-raid-manager/logger": resolve(__dirname, "./packages/logger/src"),
      "@albion-raid-manager/discord": resolve(__dirname, "./packages/discord/src"),
      "@albion-raid-manager/ai": resolve(__dirname, "./packages/ai/src"),
      "@albion-raid-manager/albion": resolve(__dirname, "./packages/albion/src"),
    },
  },
});
