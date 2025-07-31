import { logger } from "@albion-raid-manager/logger";
import { Client, Collection, Events } from "discord.js";

import { Command, loadCommands } from "./commands";
import { raids } from "./raids";

export interface ModuleParams {
  discord: Client;
}

export type Module = {
  id: string;
  enabled: boolean;
  commands: Command[];
  onLoad?: ({ discord }: ModuleParams) => Promise<void>;
  onReady?: ({ discord }: ModuleParams) => Promise<void>;
};

export const MODULES_LIST: Module[] = [raids];
export const modules = new Collection<Module["id"], Module>();

export async function initModules({ discord }: ModuleParams) {
  // Load modules and commands
  for (const module of MODULES_LIST) {
    if (!module.enabled) continue;

    try {
      if (module.onLoad) {
        await module.onLoad({ discord });
      }

      modules.set(module.id, module);
      logger.info(`Module loaded: ${module.id}`);

      if (module.commands) {
        await loadCommands(module);
      }
    } catch (error) {
      logger.error(`${module.id} ~ Load error:`, error);
    }
  }

  // Initialize callbacks
  discord.on(Events.ClientReady, async (discord: Client) => {
    logger.debug("ClientReady");

    for (const module of modules.values()) {
      try {
        if (module.onReady) {
          module.onReady({ discord });
        }
      } catch (error) {
        let message = "Unknown error";
        if (error instanceof Error) message = error.message;
        logger.error(`${module.id} ~ onReady error: ${message}`, error);
      }
    }
  });
}
