import config from "@albion-raid-manager/config";
import { runIfChanged } from "@albion-raid-manager/core/cache";
import logger from "@albion-raid-manager/logger";
import {
  APIApplicationCommand,
  Collection,
  Interaction,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

import { Module } from "./modules";

if (!config.discord.token || !config.discord.clientId) {
  throw new Error("Please define the DISCORD_TOKEN and DISCORD_CLIENT_ID.");
}

const rest = new REST().setToken(config.discord.token);

export type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: Interaction) => Promise<void>;
};

export const commands = new Collection<Command["data"]["name"], Command>();

export async function loadCommands(module: Module) {
  for (const command of module.commands) {
    if (!command.data) {
      logger.warn(`${module.id} ~ Command load has missing data. Skipping.`);
      continue;
    }

    commands.set(command.data.name, command);
    logger.debug(`${module.id} ~ Command loaded ~ ${command.data.name}`);
  }
}

export async function deployCommands() {
  const body = commands.map((command) => command.data.toJSON());
  await runIfChanged<boolean>(
    "deployCommands",
    body,
    async () => {
      try {
        logger.info(`Started refreshing ${body.length} application (/) commands.`);
        const data = (await rest.put(Routes.applicationCommands(config.discord.clientId as string), {
          body,
        })) as APIApplicationCommand[];
        logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        return true;
      } catch (error) {
        logger.error(error);
        return false;
      }
    },
    {
      debug: true,
      ignoreCache: (result) => !result,
    },
  );
}

export async function handleCommand(interaction: Interaction) {
  if (!interaction.isChatInputCommand() || !interaction.guild) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    logger.error(`handleCommand ~ ${interaction.commandName} ~ Command is not loaded.`);
    await interaction.reply({ content: "Command not found.", flags: MessageFlags.Ephemeral });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`handleCommand ~ ${command.data.name} ~ Error:`, error);
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
}
