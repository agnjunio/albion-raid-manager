import { resolve } from "path";

export const sharedConfig = {
  test: {
    environment: "node",
    globals: true,
    // More specific paths needs to be first
    alias: {
      "@albion-raid-manager/ai": resolve(__dirname, "packages/ai/src/index.ts"),
      "@albion-raid-manager/core/entities": resolve(__dirname, "packages/core/src/entities/index.ts"),
      "@albion-raid-manager/core/scheduler": resolve(__dirname, "packages/core/src/scheduler.ts"),
      "@albion-raid-manager/core/utils": resolve(__dirname, "packages/core/src/utils/index.ts"),
      "@albion-raid-manager/core": resolve(__dirname, "packages/core/src/index.ts"),
      "@albion-raid-manager/config": resolve(__dirname, "packages/config/src/index.ts"),
      "@albion-raid-manager/database": resolve(__dirname, "packages/database/src/index.ts"),
      "@albion-raid-manager/discord": resolve(__dirname, "packages/discord/src/index.ts"),
      "@albion-raid-manager/logger": resolve(__dirname, "packages/logger/src/index.ts"),
    },
  },
};
