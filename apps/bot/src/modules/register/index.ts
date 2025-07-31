import config from "@albion-raid-manager/config";

import { type Module } from "@/modules/modules";

export const register: Module = {
  id: "register",
  enabled: config.bot.register.enabled ?? false,
  commands: [],
  onReady: async ({ discord }) => {},
};
