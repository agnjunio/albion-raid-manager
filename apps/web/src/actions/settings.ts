import { ActionResponse } from "@/actions";
import { prisma } from "@albion-raid-manager/database";
import { Guild } from "@albion-raid-manager/database/models";

export type GetSettingsSuccessResponse = {
  guild: Guild;
};

export async function getSettings(guildId: string, userId: string) {
  const guild = await prisma.guild.findUnique({
    where: {
      id: guildId,
    },
  });

  if (!guild) {
    return ActionResponse.Failure("GUILD_NOT_FOUND");
  }

  return ActionResponse.Success<GetSettingsSuccessResponse>({
    guild,
  });
}
