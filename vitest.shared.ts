import { resolve } from "path";

export const sharedConfig = {
  test: {
    environment: "node",
    globals: true,
    // More specific paths needs to be first
    alias: {
      "@albion-raid-manager/ai": resolve(__dirname, "packages/ai/src/index.ts"),
      "@albion-raid-manager/core/cache/memory": resolve(__dirname, "packages/core/src/cache/memory/index.ts"),
      "@albion-raid-manager/core/cache/redis": resolve(__dirname, "packages/core/src/cache/redis/index.ts"),
      "@albion-raid-manager/core/cache/file": resolve(__dirname, "packages/core/src/cache/file/index.ts"),
      "@albion-raid-manager/core/cache/utils": resolve(__dirname, "packages/core/src/cache/utils/index.ts"),
      "@albion-raid-manager/core/config": resolve(__dirname, "packages/core/src/config/index.ts"),
      "@albion-raid-manager/core/database": resolve(__dirname, "packages/core/src/database/index.ts"),
      "@albion-raid-manager/core/discord": resolve(__dirname, "packages/core/src/discord/index.ts"),
      "@albion-raid-manager/core/entities": resolve(__dirname, "packages/core/src/entities/index.ts"),
      "@albion-raid-manager/core/logger": resolve(__dirname, "packages/core/src/logger/index.ts"),
      "@albion-raid-manager/core/redis": resolve(__dirname, "packages/core/src/redis/index.ts"),
      "@albion-raid-manager/core/scheduler": resolve(__dirname, "packages/core/src/scheduler.ts"),
      "@albion-raid-manager/core/services": resolve(__dirname, "packages/core/src/services/index.ts"),
      "@albion-raid-manager/core/utils": resolve(__dirname, "packages/core/src/utils/index.ts"),
      "@albion-raid-manager/core": resolve(__dirname, "packages/core/src/index.ts"),
      "@albion-raid-manager/types/api": resolve(__dirname, "packages/types/src/api/index.ts"),
      "@albion-raid-manager/types/entities": resolve(__dirname, "packages/types/src/entities/index.ts"),
      "@albion-raid-manager/types/services": resolve(__dirname, "packages/types/src/services/index.ts"),
      "@albion-raid-manager/types/schemas": resolve(__dirname, "packages/types/src/schemas/index.ts"),
    },
  },
};
