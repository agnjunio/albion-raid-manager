import { logger } from "@albion-raid-manager/core/logger";
import { RaidService } from "@albion-raid-manager/core/services";
import { ServiceError, ServiceErrorCode } from "@albion-raid-manager/types/services";
import { Interaction, MessageFlags, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

import { Command } from "@/modules/commands";
import { type GuildContext } from "@/modules/guild-context";

import { deleteAnnouncement } from "../announcements";
import { getRaidEventPublisher } from "../redis";

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

  execute: async (interaction: Interaction, context: GuildContext) => {
    if (!interaction.isChatInputCommand()) return;

    const guild = interaction.guild;
    if (!guild) {
      const errorMessage = await context.t("commands.errors.guildOnly");
      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user has admin permissions
    const member = await guild.members.fetch(interaction.user.id);
    if (!member.permissions.has("Administrator")) {
      const errorMessage = await context.t("commands.errors.adminRequired");
      await interaction.reply({
        content: errorMessage,
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
            await deleteAnnouncement({
              discord: interaction.client,
              raidId,
            });
            await RaidService.deleteRaid(raidId, { publisher: await getRaidEventPublisher() });

            const successMessage = await context.t("commands.raid.delete.success", { raidId });
            await interaction.editReply({
              content: successMessage,
            });

            logger.info(`Raid deleted: ${raidId}`, {
              raidId,
              guildId: guild.id,
              userId: interaction.user.id,
            });
          } catch (error) {
            logger.error("Failed to delete raid:", { error });

            let errorMessage = await context.t("commands.raid.delete.failed");

            if (ServiceError.isServiceError(error)) {
              switch (error.code) {
                case ServiceErrorCode.NOT_FOUND:
                  errorMessage = await context.t("commands.raid.delete.notFound", { raidId });
                  break;
                case ServiceErrorCode.NOT_AUTHORIZED:
                  errorMessage = await context.t("commands.raid.delete.notAuthorized");
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
          const errorMessage = await context.t("commands.errors.unknownSubcommand");
          await interaction.editReply({
            content: errorMessage,
          });
          break;
        }
      }
    } catch (error) {
      logger.error("Error in raid command:", { error });
      const errorMessage = await context.t("commands.errors.generic");
      await interaction.editReply({
        content: errorMessage,
      });
    }
  },
};
