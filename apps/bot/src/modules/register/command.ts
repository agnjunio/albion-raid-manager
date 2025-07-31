import { verifyAlbionPlayer, type AlbionUser } from "@albion-raid-manager/albion";
import { ensureUserAndServer, prisma } from "@albion-raid-manager/database";
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
    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.reply({
        content: "❌ This command can only be used in a Discord server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      // Defer the reply
      await interaction.deferReply({
        ephemeral: true,
      });

      // Verify the user exists in Albion Online
      const userData = await verifyAlbionPlayer(username, "AMERICAS");

      if (!userData) {
        await interaction.editReply({
          content: `❌ User "${username}" not found in Albion Online. Please check the spelling and try again.`,
        });
        return;
      }

      // Store the registration in database
      await storeUserRegistration(userId, userData, serverId);

      await interaction.editReply({
        content: `✅ Successfully registered as **${userData.Name}**!\n\n**Player Info:**\n• Guild: ${userData.GuildName || "None"}\n• Kill Fame: ${userData.KillFame.toLocaleString()}\n• Death Fame: ${userData.DeathFame.toLocaleString()}\n• Fame Ratio: ${(userData.FameRatio * 100).toFixed(1)}%`,
      });

      logger.info(`User ${userId} registered as ${userData.Name}`);
    } catch (error) {
      logger.error("Register command error:", error);
      await interaction.editReply({
        content: "❌ An error occurred while registering. Please try again later.",
      });
    }
  },
};

async function storeUserRegistration(discordUserId: string, userData: AlbionUser, serverId: string): Promise<void> {
  try {
    // Ensure user and server exist, then get the server member
    const { serverMember } = await ensureUserAndServer(discordUserId, userData.Name, serverId);

    // Update the server member with Albion data
    await prisma.serverMember.update({
      where: {
        serverId_userId: {
          serverId: serverMember.serverId,
          userId: serverMember.userId,
        },
      },
      data: {
        albionPlayerId: userData.Id,
        albionGuildId: userData.GuildId || null,
        killFame: userData.KillFame,
        deathFame: userData.DeathFame,
        lastUpdated: new Date(),
      },
    });

    logger.info(
      `Stored Albion player data: ${userData.Name} (${userData.Id}) for Discord user ${discordUserId} in server ${serverId}`,
    );
  } catch (error) {
    logger.error("Error storing user registration:", error);
    throw error;
  }
}
