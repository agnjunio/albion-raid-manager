import { ActionResponse } from "@/actions";
import { GuildMemberWithUser } from "@/types/database";
import { prisma } from "@albion-raid-manager/database";
import { discordService } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";

export type GetGuildMembersSuccessResponse = {
  guildMembers: GuildMemberWithUser[];
};

export async function getGuildMembers(guildId: string) {
  try {
    const guildMembers = await prisma.guildMember.findMany({
      where: {
        guildId,
      },
      include: {
        user: true,
      },
    });

    return ActionResponse.Success<GetGuildMembersSuccessResponse>({
      guildMembers,
    });
  } catch (error) {
    logger.error(`Failed to get guild members for guild ${guildId}`, { error });
    return ActionResponse.Failure("GET_GUILD_MEMBERS_FAILED");
  }
}

export async function detectServerMembers(serverId: string) {
  try {
    const serverMembers = await discordService.guilds.getMembers(serverId);

    const guildMembers = await prisma.$transaction(async (tx) => {
      for (const member of serverMembers) {
        await tx.user.upsert({
          where: {
            id: member.user.id,
          },
          update: {
            username: member.user.username,
            avatar: member.user.avatar,
          },
          create: {
            id: member.user.id,
            username: member.user.username,
            avatar: member.user.avatar,
          },
        });

        const role = "PLAYER"; // TODO: Add role detection
        await tx.guildMember.upsert({
          where: {
            guildId_userId: {
              guildId: serverId,
              userId: member.user.id,
            },
          },
          update: {
            role,
          },
          create: {
            guildId: serverId,
            userId: member.user.id,
            role,
          },
        });
      }

      return tx.guildMember.findMany({
        where: {
          guildId: serverId,
        },
        include: {
          user: true,
        },
      });
    });

    return ActionResponse.Success<GetGuildMembersSuccessResponse>({
      guildMembers,
    });
  } catch (error) {
    logger.error(`Failed to detect server members for server ${serverId}`, { error });
    return ActionResponse.Failure("DETECT_SERVER_MEMBERS_FAILED");
  }
}
