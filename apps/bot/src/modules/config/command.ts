import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import {
  Interaction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
} from "discord.js";

import { Command } from "@/commands";

export const configCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure guild settings")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("roles")
        .setDescription("Configure server roles")
        .addRoleOption((option: SlashCommandRoleOption) =>
          option.setName("member-role").setDescription("Role for server members (guild members)").setRequired(false),
        )
        .addRoleOption((option: SlashCommandRoleOption) =>
          option.setName("friend-role").setDescription("Role for friends (non-guild members)").setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("guild")
        .setDescription("Configure Albion guild ID")
        .addStringOption((option: SlashCommandStringOption) =>
          option.setName("guild-id").setDescription("Albion guild ID to match against").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) => subcommand.setName("view").setDescription("View current server configuration"))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("audit")
        .setDescription("Configure audit channel for bot events")
        .addChannelOption((option: SlashCommandChannelOption) =>
          option.setName("channel").setDescription("Channel to send audit messages to").setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("raid")
        .setDescription("Configure raid announcement channel")
        .addChannelOption((option: SlashCommandChannelOption) =>
          option.setName("channel").setDescription("Channel to send raid announcements to").setRequired(false),
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
        content: "❌ You need Administrator permissions to configure server settings.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      switch (subcommand) {
        case "roles": {
          const memberRole = interaction.options.getRole("member-role");
          const friendRole = interaction.options.getRole("friend-role");

          if (!memberRole && !friendRole) {
            await interaction.editReply({
              content: "❌ Please provide at least one role ID to configure.",
            });
            return;
          }

          const updateData: { memberRoleId?: string; friendRoleId?: string } = {};
          if (memberRole) updateData.memberRoleId = memberRole.id;
          if (friendRole) updateData.friendRoleId = friendRole.id;

          await prisma.server.update({
            where: { id: guild.id },
            data: updateData,
          });

          const roleConfig = [];
          if (memberRole) roleConfig.push(`• Member Role: ${memberRole}`);
          if (friendRole) roleConfig.push(`• Friend Role: ${friendRole}`);

          await interaction.editReply({
            content: `✅ Server roles configured successfully!\n\n${roleConfig.join("\n")}`,
          });
          break;
        }

        case "guild": {
          const guildId = interaction.options.getString("guild-id", true);

          await prisma.server.update({
            where: { id: guild.id },
            data: { serverGuildId: guildId },
          });

          await interaction.editReply({
            content: `✅ Albion guild ID configured successfully!\n\n• Guild ID: \`${guildId}\`\n\nPlayers who register with this guild ID will receive the member role.`,
          });
          break;
        }

        case "audit": {
          const auditChannel = interaction.options.getChannel("channel");

          await prisma.server.update({
            where: { id: guild.id },
            data: { auditChannelId: auditChannel?.id || null },
          });

          if (auditChannel) {
            await interaction.editReply({
              content: `✅ Audit channel configured successfully!\n\n• Audit Channel: ${auditChannel}. All events will be logged to this channel.`,
            });
          } else {
            await interaction.editReply({
              content: `✅ Audit channel disabled successfully!\n\n All events will no longer be logged.`,
            });
          }
          break;
        }

        case "raid": {
          const raidChannel = interaction.options.getChannel("channel");

          await prisma.server.update({
            where: { id: guild.id },
            data: { raidAnnouncementChannelId: raidChannel?.id || null },
          });

          if (raidChannel) {
            await interaction.editReply({
              content: `✅ Raid announcement channel configured successfully!\n\n• Raid Channel: ${raidChannel}. All raid announcements will be sent to this channel.`,
            });
          } else {
            await interaction.editReply({
              content: `✅ Raid announcement channel disabled successfully!\n\n All raid announcements will no longer be sent.`,
            });
          }
          break;
        }

        case "view": {
          const server = await prisma.server.findUnique({
            where: { id: guild.id },
            select: {
              memberRoleId: true,
              friendRoleId: true,
              serverGuildId: true,
              auditChannelId: true,
              raidAnnouncementChannelId: true,
            },
          });

          if (!server) {
            await interaction.editReply({
              content: "❌ Server configuration not found.",
            });
            return;
          }

          const config = [];
          if (server.memberRoleId) config.push(`• Member Role: <@&${server.memberRoleId}>`);
          if (server.friendRoleId) config.push(`• Friend Role: <@&${server.friendRoleId}>`);
          if (server.serverGuildId) config.push(`• Albion Guild ID: \`${server.serverGuildId}\``);
          if (server.auditChannelId) config.push(`• Audit Channel: <#${server.auditChannelId}>`);
          if (server.raidAnnouncementChannelId) config.push(`• Raid Channel: <#${server.raidAnnouncementChannelId}>`);

          if (config.length === 0) {
            config.push("• No configuration set");
          }

          await interaction.editReply({
            content: `📋 **Server Configuration**\n\n${config.join("\n")}`,
          });
          break;
        }
      }
    } catch (error) {
      logger.error("Error in config command:", { error });
      await interaction.editReply({
        content: "❌ An error occurred while configuring server settings.",
      });
    }
  },
};
