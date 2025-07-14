import { getErrorMessage } from "@albion-raid-manager/core/utils/errors";
import { prisma, RaidStatus } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Client, Interaction } from "discord.js";

import { ClientError, ErrorCodes } from "@/errors";

import { raidEvents } from "../events";

export const handleSelectRole = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  if (!interaction.isStringSelectMenu()) return;

  try {
    const raidId = interaction.customId.split(":")[2];

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        slots: true,
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN) throw new Error("Raid is not open for signups");

    const slot = interaction.values[0];

    if (
      raid.slots.some((raidSlot) => raidSlot.id === slot && raidSlot.userId && raidSlot.userId !== interaction.user.id)
    ) {
      throw new ClientError(ErrorCodes.SLOT_TAKEN, "Slot already taken, please select another one.");
    }

    const currentSlotId = raid.slots.find((raidSlot) => raidSlot.userId === interaction.user.id)?.id;
    if (currentSlotId) {
      await prisma.raidSlot.update({
        where: {
          id: currentSlotId,
        },
        data: {
          userId: null,
        },
      });
    }

    const user = await prisma.user.upsert({
      where: { id: interaction.user.id },
      update: {
        username: interaction.user.username,
        avatar: interaction.user.avatar,
      },
      create: {
        id: interaction.user.id,
        username: interaction.user.username,
        avatar: interaction.user.avatar,
      },
    });

    await prisma.raidSlot.update({
      where: {
        id: slot,
      },
      data: {
        userId: user.id,
      },
    });

    await interaction.update({
      content: `You have signed up for the raid! Good luck!`,
      components: [],
    });
    raidEvents.emit("raidSignup", raid, interaction.user);
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to select build for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });

    const content =
      error instanceof ClientError
        ? `Failed to select build: ${error.message}`
        : `Failed to select build. Please try again later.`;
    await interaction.update({
      content,
    });
  }
};
