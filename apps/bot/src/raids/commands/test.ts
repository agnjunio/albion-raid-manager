import { Command } from "@/modules";
import logger from "@albion-raid-manager/logger";
import { Interaction, SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder().setName("test");

async function handle(interaction: Interaction) {
  logger.debug("🚀 ~ test.ts:6 ~ handle ~ interaction:", interaction);
}

export const testCommand: Command = {
  data,
  handle,
};
