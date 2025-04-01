import { runIfChanged } from "@albion-raid-manager/common/helpers/fileCache";
import config from "@albion-raid-manager/config";
import logger from "@albion-raid-manager/logger";
import { APIApplicationCommand, Collection, Interaction, REST, Routes, SlashCommandBuilder } from "discord.js";
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
        const data = (await rest.put(Routes.applicationCommands(config.discord.clientId!), {
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
