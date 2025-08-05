import { resolve } from "path";

import { defineProject, mergeConfig } from "vitest/config";

import { sharedConfig } from "../../vitest.shared";

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      setupFiles: ["./vitest.setup.ts"],
      // Project-specific overrides
      alias: {
        ...sharedConfig.test.alias,
        "~": resolve(__dirname, "./src"),
      },
    },
  }),
);
