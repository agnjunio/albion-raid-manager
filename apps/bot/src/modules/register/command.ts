import { verifyAlbionPlayer, type AlbionUser } from "@albion-raid-manager/albion";
import { logger } from "@albion-raid-manager/logger";
import { Interaction, MessageFlags, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { type Command } from "../../commands";

export const registerCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register your Albion Online username")
    .addStringOption((option: SlashCommandStringOption) =>
      option
        .setName("username")
        .setDescription("Your Albion Online username")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(50),
    ) as SlashCommandBuilder,

  execute: async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const username = interaction.options.getString("username", true);
    const userId = interaction.user.id;

    try {
      // Verify the user exists in Albion Online
      const userData = await verifyAlbionPlayer(username, "AMERICAS");

      if (!userData) {
        await interaction.reply({
          content: `❌ User "${username}" not found in Albion Online. Please check the spelling and try again.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      // Store the registration
      await storeUserRegistration(userId, username, userData);

      await interaction.reply({
        content: `✅ Successfully registered as **${userData.Name}**!\n\n**Player Info:**\n• Guild: ${userData.GuildName || "None"}\n• Kill Fame: ${userData.KillFame.toLocaleString()}\n• Death Fame: ${userData.DeathFame.toLocaleString()}\n• Fame Ratio: ${(userData.FameRatio * 100).toFixed(1)}%`,
        flags: MessageFlags.Ephemeral,
      });

      logger.info(`User ${userId} registered as ${userData.Name}`);
    } catch (error) {
      logger.error("Register command error:", error);
      await interaction.reply({
        content: "❌ An error occurred while registering. Please try again later.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

async function storeUserRegistration(
  discordUserId: string,
  albionUsername: string,
  userData: AlbionUser,
): Promise<void> {
  // TODO: Implement storage logic
  // This could be stored in a database, file, or other storage solution
  // For now, we'll just log it
  logger.info(`Storing registration: Discord ${discordUserId} -> Albion ${albionUsername} (${userData.Id})`);
}
