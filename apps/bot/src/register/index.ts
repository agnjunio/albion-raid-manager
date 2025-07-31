import config from "@albion-raid-manager/config";
import { logger } from "@albion-raid-manager/logger";

import { type Module } from "@/modules";

export const register: Module = {
  id: "register",
  enabled: config.bot.register.enabled ?? false,
  commands: [],
  onReady: async ({ discord }) => {
    logger.info("Register module ready");
  },
};
