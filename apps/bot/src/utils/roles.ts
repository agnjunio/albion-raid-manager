import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
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
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: {
        memberRoleId: true,
        friendRoleId: true,
        serverGuildId: true,
      },
    });

    if (!server) {
      logger.warn(`Server configuration not found for server ${serverId}`);
      return;
    }

    const memberRole = server.memberRoleId ? member.guild.roles.cache.get(server.memberRoleId) : null;
    const friendRole = server.friendRoleId ? member.guild.roles.cache.get(server.friendRoleId) : null;

    // Check if player is in the server's guild
    const isInServerGuild = server.serverGuildId && albionGuildId === server.serverGuildId;

    if (isInServerGuild && memberRole) {
      await member.roles.add(memberRole);

      if (friendRole) {
        await member.roles.remove(friendRole);
      }

      logger.info(`Added member role to user ${member.nickname} in server ${serverId}`, {
        memberRole,
        friendRole,
        isInServerGuild,
      });
    } else if (!isInServerGuild && friendRole) {
      await member.roles.add(friendRole);

      if (memberRole) {
        await member.roles.remove(memberRole);
      }

      logger.info(`Added friend role to user ${member.nickname} in server ${serverId}`, {
        memberRole,
        friendRole,
        isInServerGuild,
      });
    }
  } catch (error) {
    logger.error(`Failed to assign roles for user ${member.user.id} in server ${serverId}:`, { error });
    // Don't throw - role assignment failure shouldn't break registration
  }
}
