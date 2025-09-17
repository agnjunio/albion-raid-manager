import { logger } from "@albion-raid-manager/core/logger";
import { RaidEvent, RaidEventType } from "@albion-raid-manager/core/redis/index";
import { RaidService, UsersService } from "@albion-raid-manager/core/services";
import { getErrorMessage } from "@albion-raid-manager/core/utils";

import { ClientError, ErrorCodes } from "@/errors";
import { type InteractionHandlerProps } from "@/modules/modules";

import { handleRaidUpdated } from "./handleRaidEvents";

export const handleSelectRole = async ({ discord, interaction, context }: InteractionHandlerProps) => {
  if (!interaction.isStringSelectMenu()) return;
  const { t } = context;

  try {
    const raidId = interaction.customId.split(":")[2];

    const raid = await RaidService.findRaidById(raidId, { slots: true });

    if (!raid) throw new Error("Raid not found");
    if (raid.status !== "OPEN") throw new Error("Raid is not open for signups");
    if (!raid.slots) throw new Error("Raid slots not found");

    const slot = interaction.values[0];

    if (
      raid.slots.some((raidSlot) => raidSlot.id === slot && raidSlot.userId && raidSlot.userId !== interaction.user.id)
    ) {
      throw new ClientError(ErrorCodes.SLOT_TAKEN, "Slot already taken, please select another one.");
    }

    await UsersService.ensureUser(interaction.user.id, {
      id: interaction.user.id,
      username: interaction.user.username,
      nickname: interaction.user.globalName,
      avatar: interaction.user.avatar,
    });

    await RaidService.updateRaidSlot(slot, {
      userId: interaction.user.id,
    });

    const updatedRaid = await RaidService.findRaidById(raidId, { slots: true });
    if (!updatedRaid) throw new Error("Raid not found");

    const successMessage = t("raids.signup.success");
    await interaction.update({
      content: successMessage,
      components: [],
    });

    const event: RaidEvent = {
      type: RaidEventType.UPDATED,
      timestamp: new Date().toISOString(),
      entityId: raidId,
      serverId: raid.serverId,
      data: {
        raid: updatedRaid,
        previousRaid: {
          slots: raid.slots,
        },
      },
    };
    handleRaidUpdated({ discord, event, context });
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
