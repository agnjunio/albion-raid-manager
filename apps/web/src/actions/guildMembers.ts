"use server";

import { ActionResponse } from "@/actions";
import { GuildMemberWithUser } from "@/types/database";
import { prisma } from "@albion-raid-manager/database";
import { GuildMemberRole } from "@albion-raid-manager/database/models";
import { APIGuildMember, discordService } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";
import { syncUsers } from "./users";

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

export type GetGuildMemberSuccessResponse = {
  guildMember: GuildMemberWithUser;
  discordMember: APIGuildMember;
};

export async function getGuildMember(guildId: string, userId: string) {
  try {
    const guildMember = await prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId,
          userId,
        },
      },
      include: {
        guild: true,
        user: true,
      },
    });
    if (!guildMember) {
      return ActionResponse.Failure("GUILD_MEMBER_NOT_FOUND");
    }

    const discordMember = await discordService.guilds.getMember(guildMember.guild.discordId, userId);
    if (!discordMember) {
      return ActionResponse.Failure("DISCORD_MEMBER_NOT_FOUND");
    }

    return ActionResponse.Success<GetGuildMemberSuccessResponse>({
      guildMember,
      discordMember,
    });
  } catch (error) {
    logger.error(`Failed to get guild member ${guildId}/${userId}`, { error });
    return ActionResponse.Failure("GET_GUILD_MEMBER_FAILED");
  }
}

export async function syncServerMembers(serverId: string) {
  try {
    const server = await prisma.guild.findUnique({
      where: {
        id: serverId,
      },
    });

    if (!server) {
      return ActionResponse.Failure("SERVER_NOT_FOUND");
    }

    const serverMembers = await discordService.guilds.getMembers(server.discordId);
    if (!serverMembers) {
      return ActionResponse.Failure("SERVER_MEMBERS_NOT_FOUND");
    }

    const syncResponse = await syncUsers(serverMembers.map((member) => member.user));
    if (!syncResponse.success) {
      return syncResponse;
    }

    const guildMembers = await prisma.$transaction(async (tx) => {
      const currentGuildMembers = await tx.guildMember.findMany({
        where: {
          guildId: server.id,
        },
      });

      // Remove guild members that are not in the server members
      await tx.guildMember.deleteMany({
        where: {
          guildId: server.id,
          userId: { notIn: serverMembers.map((member) => member.user.id) },
        },
      });

      // Create guild members that are not in the database
      const guildMembersToCreate = serverMembers
        .filter((member) => !currentGuildMembers.some((currentMember) => currentMember.userId === member.user.id))
        .map((member) => ({
          guildId: server.id,
          userId: member.user.id,
          nickname: member.nick ?? member.user.global_name,
          role: GuildMemberRole.PLAYER, // TODO: Add role detection
        }));

      await tx.guildMember.createMany({
        data: guildMembersToCreate,
        skipDuplicates: true,
      });

      // Update guild members that are in the database
      await Promise.all(
        serverMembers
          .filter((member) => currentGuildMembers.some((currentMember) => currentMember.userId === member.user.id))
          .map((member) =>
            tx.guildMember.update({
              where: {
                guildId_userId: {
                  guildId: server.id,
                  userId: member.user.id,
                },
              },
              data: { nickname: member.nick ?? member.user.global_name },
            }),
          ),
      );

      return tx.guildMember.findMany({
        where: {
          guildId: server.id,
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
