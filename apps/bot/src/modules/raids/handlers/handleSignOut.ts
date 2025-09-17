import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { getErrorMessage } from "@albion-raid-manager/core/utils";

import { ClientError, ErrorCodes } from "@/errors";

import { createOrUpdateAnnouncement } from "../announcements";

import { type InteractionHandlerProps } from "./index";

export const handleSignout = async ({ discord, interaction, context }: InteractionHandlerProps) => {
  const { t } = context;
  if (!interaction.isButton()) return;

  try {
    const raidId = interaction.customId.split(":")[2];
    if (!raidId) throw new Error("Missing raid id");

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        slots: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== "OPEN") throw new ClientError(ErrorCodes.RAID_NOT_OPEN, "Raid is not open for leaving");

    const slot = raid.slots.find((slot) => slot.userId === interaction.user.id);
    if (!slot) throw new ClientError(ErrorCodes.USER_NOT_SIGNED, "User is not signed up for the raid");

    await prisma.raidSlot.update({
      where: { id: slot.id },
      data: { userId: null },
    });

    const leaveMessage = await t("raids.signout.success");
    await interaction.reply({
      content: leaveMessage,
      ephemeral: true,
    });

    createOrUpdateAnnouncement({ discord, raidId: raid.id, serverId: raid.serverId, context });
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;

    logger.error(`Failed to sign out for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });

    const content =
      error instanceof ClientError
        ? await t("raids.errors.signoutFailed", { error: error.message })
        : await t("raids.errors.signoutGeneric");
    await interaction.reply({
      content,
      ephemeral: true,
    });
  }
};
