import { RaidService } from "@albion-raid-manager/core/services";
import { logger } from "@albion-raid-manager/core/logger";
import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { Interaction, MessageFlags, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { Command } from "@/commands";

import { handleAnnouncementDelete } from "../handlers";
import { getRaidEventPublisher } from "../helpers/redis";

export const raidCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Manage raids")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a raid")
        .addStringOption((option: SlashCommandStringOption) =>
          option
            .setName("raid-id")
            .setDescription("The ID of the raid to delete")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(50),
        ),
    ) as SlashCommandBuilder,

  execute: async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "❌ This command can only be used in a Discord server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user has admin permissions
    const member = await guild.members.fetch(interaction.user.id);
    if (!member.permissions.has("Administrator")) {
      await interaction.reply({
        content: "❌ You need Administrator permissions to manage raids.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      switch (subcommand) {
        case "delete": {
          const raidId = interaction.options.getString("raid-id", true);

          try {
            await handleAnnouncementDelete({
              discord: interaction.client,
              raidId,
            });
            await RaidService.deleteRaid(raidId, { publisher: await getRaidEventPublisher() });

            await interaction.editReply({
              content: `✅ Raid \`${raidId}\` has been deleted successfully.`,
            });

            logger.info(`Raid deleted: ${raidId}`, {
              raidId,
              guildId: guild.id,
              userId: interaction.user.id,
            });
          } catch (error) {
            logger.error("Failed to delete raid:", { error });

            let errorMessage = "❌ Failed to delete raid. Please try again later.";

            if (ServiceError.isServiceError(error)) {
              switch (error.code) {
                case ServiceErrorCode.NOT_FOUND:
                  errorMessage = `❌ Raid \`${raidId}\` not found. Please check the raid ID and try again.`;
                  break;
                case ServiceErrorCode.NOT_AUTHORIZED:
                  errorMessage = "❌ You don't have permission to delete this raid.";
                  break;
              }
            }

            await interaction.editReply({
              content: errorMessage,
            });
          }
          break;
        }

        default: {
          await interaction.editReply({
            content: "❌ Unknown subcommand.",
          });
          break;
        }
      }
    } catch (error) {
      logger.error("Error in raid command:", { error });
      await interaction.editReply({
        content: "❌ An error occurred while processing the command.",
      });
    }
  },
};
