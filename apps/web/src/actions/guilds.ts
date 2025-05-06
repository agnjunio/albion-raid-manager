"use server";

import { ActionResponse, guildMembersActions } from "@/actions";
import { GuildPermissionType } from "@/types/database";
import { prisma } from "@albion-raid-manager/database";
import { Guild } from "@albion-raid-manager/database/models";
import { APIGuildMember, discordService, type Server } from "@albion-raid-manager/discord";
import logger from "@albion-raid-manager/logger";

export type CreateGuildSuccessResponse = {
  guild: Guild;
};

export async function createGuild(server: Server, userId: string) {
  try {
    const existingGuild = await prisma.guild.findUnique({
      where: {
        discordId: server.id,
      },
    });

    if (existingGuild) {
      return ActionResponse.Failure("GUILD_ALREADY_EXISTS");
    }

    const user = await discordService.users.getUser(userId);

    if (!user) {
      return ActionResponse.Failure("USER_NOT_FOUND");
    }

    const guild = await prisma.guild.create({
      data: {
        discordId: server.id,
        name: server.name,
        icon: server.icon,
        members: {
          create: {
            userId,
            role: "LEADER",
            default: true,
            nickname: user.global_name,
          },
        },
      },
    });

    return ActionResponse.Success<CreateGuildSuccessResponse>({
      guild,
    });
  } catch (error) {
    logger.error(`Failed to create guild for server ${server.id}`, error);
    return ActionResponse.Failure("CREATE_GUILD_FAILED");
  }
}

export type GetGuildSuccessResponse = {
  guild: Guild;
};

export async function getGuild(guildId: string) {
  try {
    const guild = await prisma.guild.findUnique({
      where: {
        id: guildId,
      },
    });

    if (!guild) {
      return ActionResponse.Failure("GUILD_NOT_FOUND");
    }

    return ActionResponse.Success<GetGuildSuccessResponse>({
      guild,
    });
  } catch (error) {
    logger.error(`Failed to get guild ${guildId}`, error);
    return ActionResponse.Failure("GET_GUILD_FAILED");
  }
}

export type UpdateGuildSuccessResponse = {
  guild: Guild;
};

export async function updateGuild(guildId: string, data: Partial<Guild>) {
  try {
    const guild = await prisma.guild.update({
      where: {
        id: guildId,
      },
      data,
    });

    return ActionResponse.Success<UpdateGuildSuccessResponse>({
      guild,
    });
  } catch (error) {
    logger.error(`Failed to update guild ${guildId}`, error);
    return ActionResponse.Failure("UPDATE_GUILD_FAILED");
  }
}

export type HasPermissionSuccessResponse = {
  discordMember: APIGuildMember;
  guild: Guild;
  hasPermission: boolean;
};

export async function hasPermission(guildId: string, userId: string, permissions: GuildPermissionType[]) {
  try {
    const guildResponse = await getGuild(guildId);
    if (!guildResponse.success) {
      return ActionResponse.Failure("GET_GUILD_FAILED");
    }

    const guildMemberResponse = await guildMembersActions.getGuildMember(guildId, userId);
    if (!guildMemberResponse.success) {
      return ActionResponse.Failure("GET_GUILD_MEMBER_FAILED");
    }

    const { guild } = guildResponse.data;
    const { discordMember } = guildMemberResponse.data;
    const hasPermission = permissions.reduce((acc, permission) => {
      return acc || guild[permission].some((roleId) => discordMember.roles.includes(roleId));
    }, false);

    return ActionResponse.Success<HasPermissionSuccessResponse>({
      discordMember,
      guild,
      hasPermission,
    });
  } catch (error) {
    logger.error(`Failed to update guild ${guildId}`, error);
    return ActionResponse.Failure("UPDATE_GUILD_FAILED");
  }
}
