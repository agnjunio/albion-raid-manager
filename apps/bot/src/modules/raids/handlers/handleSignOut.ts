import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { prisma, RaidStatus } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/core/logger";
import { Client, Interaction } from "discord.js";

import { ClientError, ErrorCodes } from "@/errors";

import { raidEvents } from "../events";

export const handleSignout = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  if (!interaction.isButton()) return;

  try {
    const raidId = interaction.customId.split(":")[2];
    if (!raidId) throw new Error("Missing raid id");

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        slots: true,
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== RaidStatus.OPEN)
      throw new ClientError(ErrorCodes.RAID_NOT_OPEN, "Raid is not open for leaving");

    const slot = raid.slots.find((slot) => slot.userId === interaction.user.id);
    if (!slot) throw new ClientError(ErrorCodes.USER_NOT_SIGNED, "User is not signed up for the raid");

    await prisma.raidSlot.update({
      where: { id: slot.id },
      data: { userId: null },
    });

    await interaction.reply({
      content: `You have left the raid. We hope to see you next time!`,
      ephemeral: true,
    });
    raidEvents.emit("raidSignout", raid, interaction.user);
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to sign out for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });

    const content =
      error instanceof ClientError
        ? `Failed to leave raid: ${error.message}`
        : `Failed to leave raid. Please try again later.`;
    await interaction.reply({
      content,
      ephemeral: true,
    });
  }
};
