import { type Module } from "@/modules/modules";

import { registerCommand } from "./command";

export const register: Module = {
  id: "register",
  enabled: true,
  commands: [registerCommand],
  onReady: async ({ discord: _discord }) => {},
};
