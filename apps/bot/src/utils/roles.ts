import { logger } from "@albion-raid-manager/core/logger";
import { ServersService } from "@albion-raid-manager/core/services";
import { GuildMember } from "discord.js";

/**
 * Assigns roles to a member based on server configuration and Albion guild membership
 * @param member - The Discord guild member
 * @param serverId - The Discord server ID
 * @param albionGuildId - The Albion guild ID from player data
 */
export async function assignRolesBasedOnGuild(
  member: GuildMember,
  serverId: string,
  albionGuildId: string | null,
): Promise<void> {
  try {
    // Get server configuration
    const server = await ServersService.getServerById(serverId);

    if (!server) {
      logger.warn(`Server configuration not found for server ${serverId}`);
      return;
    }

    const memberRole = server.memberRoleId ? member.guild.roles.cache.get(server.memberRoleId) : null;
    const registeredRole = server.friendRoleId ? member.guild.roles.cache.get(server.friendRoleId) : null;

    // Check if player is in the server's guild
    const isInServerGuild = server.serverGuildId && albionGuildId === server.serverGuildId;

    if (registeredRole) {
      await member.roles.add(registeredRole);

      logger.info(`Added registered role to user ${member.nickname} in server ${serverId}`, {
        memberRole,
        registeredRole,
        isInServerGuild,
      });
    }

    if (isInServerGuild && memberRole) {
      await member.roles.add(memberRole);

      logger.info(`Added member role to user ${member.nickname} in server ${serverId}`, {
        memberRole,
        registeredRole,
        isInServerGuild,
      });
    }
  } catch (error) {
    logger.error(`Failed to assign roles for user ${member.user.id} in server ${serverId}:`, { error });
    // Don't throw - role assignment failure shouldn't break registration
  }
}
