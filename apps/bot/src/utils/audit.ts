import { logger } from "@albion-raid-manager/core/logger";
import { ServersService } from "@albion-raid-manager/core/services";
import { Client, EmbedBuilder, GuildMember } from "discord.js";

/**
 * Sends an audit message to the configured audit channel for user registration
 * @param client - The Discord client
 * @param serverId - The Discord server ID
 * @param member - The Discord guild member
 * @param albionData - The Albion player data
 * @param action - The action being audited (e.g., "registration", "role_assignment")
 */
export async function sendAuditMessage(
  client: Client,
  serverId: string,
  member: GuildMember,
  albionData: {
    Name: string;
    GuildName?: string;
    KillFame: number;
    DeathFame: number;
    FameRatio: number;
    GuildId?: string;
  },
  action: "registration" | "role_assignment" = "registration",
): Promise<void> {
  try {
    // Get server configuration to check if audit channel is configured
    const server = await ServersService.getServerById(serverId);

    if (!server?.auditChannelId) {
      // No audit channel configured, skip silently
      return;
    }

    // Get the audit channel
    const guild = client.guilds.cache.get(serverId);
    if (!guild) {
      logger.warn(`Guild not found for audit message: ${serverId}`);
      return;
    }

    const auditChannel = await guild.channels.fetch(server.auditChannelId);
    if (!auditChannel?.isTextBased()) {
      logger.warn(`Audit channel not found or not a text channel: ${server.auditChannelId}`);
      return;
    }

    // Create audit embed
    const embed = new EmbedBuilder()
      .setTitle(`👤 User ${action === "registration" ? "Registration" : "Role Assignment"}`)
      .setColor(action === "registration" ? "#00ff00" : "#0099ff")
      .setTimestamp()
      .setFooter({ text: `Server: ${server.name}` });

    // Add user information
    embed.addFields(
      {
        name: "Discord User",
        value: `${member.user.tag} (${member.user.id})`,
        inline: true,
      },
      {
        name: "Nickname",
        value: member.nickname || "None",
        inline: true,
      },
      {
        name: "Albion Character",
        value: albionData.Name,
        inline: true,
      },
    );

    // Add Albion information
    embed.addFields(
      {
        name: "Guild",
        value: albionData.GuildName || "None",
        inline: true,
      },
      {
        name: "Kill Fame",
        value: albionData.KillFame.toLocaleString(),
        inline: true,
      },
      {
        name: "Death Fame",
        value: albionData.DeathFame.toLocaleString(),
        inline: true,
      },
      {
        name: "Fame Ratio",
        value: `${(albionData.FameRatio * 100).toFixed(1)}%`,
        inline: true,
      },
    );

    // Add action-specific information
    if (action === "role_assignment") {
      const memberRole = member.roles.cache.find(
        (role) => role.name.toLowerCase().includes("member") || role.name.toLowerCase().includes("guild"),
      );
      const friendRole = member.roles.cache.find(
        (role) => role.name.toLowerCase().includes("friend") || role.name.toLowerCase().includes("ally"),
      );

      embed.addFields({
        name: "Assigned Roles",
        value: [
          memberRole ? `✅ ${memberRole.name}` : "❌ No member role",
          friendRole ? `✅ ${friendRole.name}` : "❌ No friend role",
        ].join("\n"),
        inline: false,
      });
    }

    // Send the audit message
    await auditChannel.send({ embeds: [embed] });

    logger.info(`Sent audit message for ${action} to channel ${server.auditChannelId}`, {
      serverId,
      userId: member.user.id,
      action,
    });
  } catch (error) {
    logger.error(`Failed to send audit message for ${action}:`, { error });
    // Don't throw - audit failure shouldn't break the main flow
  }
}
