import { ensureUser, prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { getErrorMessage } from "@albion-raid-manager/core/utils";
import { GuildMember } from "discord.js";

import { ClientError, ErrorCodes } from "@/errors";

import { createOrUpdateAnnouncement } from "../announcements";

import { type InteractionHandlerProps } from "./index";

export const handleSelectRole = async ({ discord, interaction, context }: InteractionHandlerProps) => {
  if (!interaction.isStringSelectMenu()) return;
  const { t } = context;

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

    const successMessage = t("raids.signup.success");
    await interaction.update({
      content: successMessage,
      components: [],
    });

    createOrUpdateAnnouncement({ discord, raidId: raid.id, serverId: raid.serverId, context });
  } catch (error) {
    if (!interaction.isRepliable()) return;
    if (interaction.replied) return;
    const { t } = context;

    logger.error(`Failed to select build for raid: ${getErrorMessage(error)}`, {
      interaction: interaction.toJSON(),
      error,
    });

    const content =
      error instanceof ClientError
        ? t("raids.errors.selectBuildFailed", { error: error.message })
        : t("raids.errors.selectBuildGeneric");
    await interaction.update({
      content,
    });
  }
};
