import { ActionResponse } from "@/actions";
import { GuildMemberWithUser } from "@/types/database";
import { prisma } from "@albion-raid-manager/database";
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
