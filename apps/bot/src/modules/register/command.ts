import { AlbionAPIError, verifyAlbionPlayer } from "@albion-raid-manager/albion";
import { ensureUserAndServer, prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Interaction, MessageFlags, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { Command } from "@/commands";
import { getGuild, getGuildMember } from "@/utils/discord";
import { assignRolesBasedOnGuild } from "@/utils/roles";

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

    if (!interaction.guildId) {
      await interaction.reply({
        content: "❌ This command can only be used in a Discord server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const guild = await getGuild(interaction.client, interaction.guildId);
    const member = await getGuildMember(interaction.client, interaction.guildId, userId);

    try {
      // Defer the reply
      await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
      });

      // Verify the user exists in Albion Online
      const userData = await verifyAlbionPlayer(username, "AMERICAS");

      if (!userData) {
        await interaction.editReply({
          content: `❌ User "${username}" not found in Albion Online.\n\n**Possible reasons:**\n• Check the spelling of your username\n• Make sure you're searching on the correct server (Americas)\n• The player might not exist or have a different name\n\n**Tips:**\n• Usernames are case-sensitive\n• Try searching for your exact in-game name\n• If you recently changed your name, try your old username`,
        });
        return;
      }

      // Ensure user and server exist, then get the server member
      const { serverMember } = await ensureUserAndServer({
        user: {
          id: userId,
          username: interaction.user.username,
          avatar: interaction.user.avatar ?? null,
          nickname: member.nickname ?? null,
        },
        server: {
          id: guild.id,
          name: guild.name,
          icon: guild.iconURL() ?? null,
        },
      });

      // Update the server member with Albion data
      await prisma.serverMember.update({
        where: {
          serverId_userId: {
            serverId: serverMember.serverId,
            userId: serverMember.userId,
          },
        },
        data: {
          nickname: userData.Name,
          albionPlayerId: userData.Id,
          albionGuildId: userData.GuildId || null,
          killFame: userData.KillFame,
          deathFame: userData.DeathFame,
          lastUpdated: new Date(),
        },
      });

      await interaction.editReply({
        content: `✅ Successfully registered as **${userData.Name}**!\n\n**Player Info:**\n• Guild: ${userData.GuildName || "None"}\n• Kill Fame: ${userData.KillFame.toLocaleString()}\n• Death Fame: ${userData.DeathFame.toLocaleString()}\n• Fame Ratio: ${(userData.FameRatio * 100).toFixed(1)}%`,
      });

      // Update the user's nickname to their Albion character name
      try {
        await member.setNickname(userData.Name);
        logger.info(`Updated nickname for user ${userId} to ${userData.Name}`);
      } catch (nicknameError) {
        logger.warn(`Failed to update nickname for user ${userId}:`, nicknameError);
        // Don't fail the registration if nickname update fails
      }

      // Assign roles based on guild membership
      await assignRolesBasedOnGuild(member, guild.id, userData.GuildId || null);

      logger.info(`User ${userId} registered as ${userData.Name}`, {
        userId,
        member,
        guild,
      });
    } catch (error) {
      logger.error("Register command error:", error);

      let errorMessage = "❌ An error occurred while registering. Please try again later.";

      if (error instanceof AlbionAPIError) {
        // Handle specific Albion API errors
        switch (error.status) {
          case 404:
            errorMessage = `❌ User "${username}" not found in Albion Online.\n\n**Possible reasons:**\n• Check the spelling of your username\n• Make sure you're searching on the correct server (Americas)\n• The player might not exist or have a different name\n\n**Tips:**\n• Usernames are case-sensitive\n• Try searching for your exact in-game name\n• If you recently changed your name, try your old username`;
            break;
          case 429:
            errorMessage = "❌ Too many requests to Albion Online API. Please wait a moment and try again.";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage =
              "❌ Albion Online servers are currently experiencing issues. Please try again in a few minutes.";
            break;
          case 403:
            errorMessage = "❌ Access to Albion Online API is currently restricted. Please try again later.";
            break;
          default:
            errorMessage = `❌ Albion Online API error (${error.status}). Please try again later.\n\n**Error details:** ${error.message}`;
            break;
        }
      } else if (error instanceof Error) {
        // Handle network or other errors
        if (error.message.includes("timeout") || error.message.includes("ECONNRESET")) {
          errorMessage = "❌ Connection to Albion Online timed out. Please try again later.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "❌ Network error while connecting to Albion Online. Please try again later.";
        } else {
          errorMessage = `❌ An unexpected error occurred: ${error.message}\n\nPlease try again later.`;
        }
      }

      await interaction.editReply({
        content: errorMessage,
      });
    }
  },
};
