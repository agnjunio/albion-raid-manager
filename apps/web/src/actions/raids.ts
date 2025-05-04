"use server";

import { raidFormSchema } from "@/lib/schemas/raid";
import { CompositionWithBuilds } from "@/types/database";
import { prisma } from "@albion-raid-manager/database";
import { Raid } from "@albion-raid-manager/database/models";
import logger from "@albion-raid-manager/logger";
import { z } from "zod";
import { ActionResponse } from ".";

type CreateRaidSuccessResponse = {
  raid: Raid;
};

export async function createRaid(guildId: string, data: z.infer<typeof raidFormSchema>) {
  try {
    const { description, date } = data;

    let composition: CompositionWithBuilds | null;
    if (data.composition) {
      composition = await prisma.composition.findUnique({
        where: {
          id: data.composition.id,
        },
        include: {
          builds: true,
        },
      });

      if (!composition) {
        return ActionResponse.Failure("COMPOSITION_NOT_FOUND");
      }
    }

    return await prisma.$transaction(async (tx) => {
      const raid = await tx.raid.create({
        data: {
          description,
          date,
          guildId: guildId,
        },
      });

      if (composition) {
        await tx.raidSlot.createMany({
          data: composition.builds.map((build) => ({
            raidId: raid.id,
            name: build.name,
            role: build.role,
          })),
        });
      }

      return ActionResponse.Success<CreateRaidSuccessResponse>({
        raid,
      });
    });
  } catch (error) {
    logger.error(`Failed to create raid for guild ${guildId}`, error);
    return ActionResponse.Failure("RAID_CREATION_FAILED");
  }
}
