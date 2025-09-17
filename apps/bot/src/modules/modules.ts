import { logger } from "@albion-raid-manager/core/logger";
import { Client, Collection, Events, Interaction } from "discord.js";

import { deployCommands, handleCommand, loadCommands, type Command } from "./commands";
import { createGuildContext, type GuildContext } from "./guild-context";

import { MODULES_LIST } from ".";

export interface ModuleParams {
  discord: Client;
}

export type Module = {
  id: string;
  enabled: boolean;
  commands: Command[];
  onLoad?: ({ discord }: ModuleParams) => Promise<void>;
  onReady?: ({ discord }: ModuleParams) => Promise<void>;
  onMessageComponent?: (customId: string, interaction: Interaction, context: GuildContext) => Promise<void>;
};

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
      logger.error(`${module.id} ~ Load error:`, { error });
    }
  }

  // Deploy commands if they have been loaded
  await deployCommands();

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
        logger.error(`${module.id} ~ onReady error: ${message}`, { error });
      }
    }
  });

  // Handle command interactions
  discord.on(Events.InteractionCreate, handleCommand);

  // Handle message component interactions
  discord.on(Events.InteractionCreate, async (interaction: Interaction) => {
    // Only process guild interactions
    if (!interaction.guild) return;
    if (!interaction.isMessageComponent()) return;

    const [moduleId, action] = interaction.customId.split(":");

    // Find the module that handles this interaction
    const module = modules.get(moduleId);
    const handler = module?.onMessageComponent;
    if (handler) {
      try {
        const context = await createGuildContext(interaction.guild);
        await handler(action, interaction, context);
      } catch (error) {
        logger.error(`${module.id} ~ onMessageComponent error:`, { error, interaction: interaction.toJSON() });
      }
    }
  });
}
