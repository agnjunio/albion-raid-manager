import logger from "@albion-raid-manager/logger";
import { Client, Collection, Events, MessageFlags } from "discord.js";
import { Command, commands, deployCommands, loadCommands } from "./commands";
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

export const MODULES_LIST: Module[] = [raids];
export const modules = new Collection<Module["id"], Module>();

export async function initModules({ discord }: ModuleParams) {
  // Load modules and commands
  for (const module of MODULES_LIST) {
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

  // Deploy commands in background
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
        logger.error(`${module.id} ~ onReady error: ${message}`, error);
      }
    }
  });

  discord.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guild) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      logger.error(`${interaction.commandName} ~ Command is not loaded.`);
      await interaction.reply({ content: "Command not found.", flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`${command.data.name} ~ Error:`, error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  });
}
