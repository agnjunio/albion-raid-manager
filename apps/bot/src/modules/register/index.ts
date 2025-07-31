import config from "@albion-raid-manager/config";

import { type Module } from "@/modules/modules";

import { registerCommand } from "./command";

export const register: Module = {
  id: "register",
  enabled: config.bot.register.enabled ?? false,
  commands: [registerCommand],
  onReady: async ({ discord: _discord }) => {},
};
