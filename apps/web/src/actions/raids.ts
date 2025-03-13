"use server";

import { raidFormSchema } from "@/lib/schemas/raid";
import { CompositionWithSlots } from "@/types/database";
import { prisma } from "@albion-raid-manager/database";
import { Raid } from "@albion-raid-manager/database/models";
import logger from "@albion-raid-manager/logger";
import { z } from "zod";
import { ActionResponse } from "./action-response";

type CreateRaidSuccessResponse = {
  raid: Raid;
};

export async function createRaid(guildId: string, data: z.infer<typeof raidFormSchema>) {
  try {
    const { description, date } = data;

    let composition: CompositionWithSlots | null;
    if (data.composition) {
      composition = await prisma.composition.findUnique({
        where: {
          id: data.composition.id,
        },
        include: {
          slots: true,
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
          guildId: Number(guildId),
        },
      });

      if (composition) {
        await tx.raidSlot.createMany({
          data: composition.slots.map((slot) => ({
            raidId: raid.id,
            buildId: slot.buildId,
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
