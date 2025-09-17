import { ensureUser, prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { Client, GuildMember, Interaction } from "discord.js";

import { ClientError, ErrorCodes } from "@/errors";

import { handleAnnouncementCreate } from "./handleAnnouncementCreate";

export const handleSelectRole = async ({ interaction }: { discord: Client; interaction: Interaction }) => {
  if (!interaction.isStringSelectMenu()) return;

  try {
    const raidId = interaction.customId.split(":")[2];

    const raid = await prisma.raid.findUnique({
      where: { id: raidId },
      include: {
        slots: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== "OPEN") throw new Error("Raid is not open for signups");

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

    const user = await ensureUser({
      id: interaction.user.id,
      username: interaction.user.username,
      nickname: (interaction.member as GuildMember)?.nickname ?? null,
      avatar: interaction.user.avatar,
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

    handleAnnouncementCreate({ discord: interaction.client, raidId: raid.id, serverId: raid.serverId });
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
