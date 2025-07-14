import { logger } from "@albion-raid-manager/logger";
import { Interaction, SlashCommandBuilder } from "discord.js";

import { Command } from "@/commands";

const data = new SlashCommandBuilder().setName("raid").setDescription("Raid Options").setDefaultMemberPermissions("0");

async function execute(interaction: Interaction) {
  logger.debug(interaction);
}

export const raidCommand: Command = {
  data,
  execute,
};
