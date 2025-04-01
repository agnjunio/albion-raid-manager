import { Command } from "@/commands";
import logger from "@albion-raid-manager/logger";
import { Interaction, SlashCommandBuilder } from "discord.js";

async function execute(interaction: Interaction) {
  logger.debug("🚀 ~ test.ts:6 ~ handle ~ interaction:", interaction);
}

export const testCommand: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("Help").setDefaultMemberPermissions("0"),
  execute,
};
