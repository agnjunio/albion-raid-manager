import logger from "@albion-raid-manager/logger";
import { Client, Collection, Events, Interaction, SlashCommandBuilder } from "discord.js";
import { raids } from "./raids";

export interface ModuleParams {
  discord: Client;
}

export type Module = {
  id: string;
  commands: Command[];
  onLoad?: ({ discord }: ModuleParams) => Promise<void>;
  onReady?: ({ discord }: ModuleParams) => Promise<void>;
};

export type Command = {
  data: SlashCommandBuilder;
  handle: (interaction: Interaction) => Promise<void>;
};

const modules: Module[] = [raids];
const commands = new Collection();

async function loadCommands(module: Module) {
  for (const command of module.commands) {
    if (!command.data) {
      logger.warn(`${module.id} ~ Command load has missing data. Skipping.`);
      continue;
    }

    commands.set(command.data.name, command);
    logger.debug(`${module.id} ~ Command loaded ~ ${command.data.name}`);
  }
}

export async function loadModules({ discord }: ModuleParams) {
  for (const module of modules) {
    try {
      logger.info(`Module loaded: ${module.id}`);

      if (module.onLoad) {
        await module.onLoad({ discord });
      }

      // Detect commands
      await loadCommands(module);
    } catch (error) {
      logger.error(`${module.id} ~ Load error:`, error);
    }
  }

  discord.on(Events.ClientReady, async (discord: Client) => {
    logger.debug("ClientReady");

    for (const module of modules) {
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

  discord.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guild) return;
  });
}
