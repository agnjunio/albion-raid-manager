import { logger } from "@albion-raid-manager/core/logger";

import { createOrUpdateAnnouncement, deleteAnnouncement, sendThreadUpdate } from "../announcements";

import { type RaidEventHandlerProps } from "./index";

export async function handleRaidCreated({ discord, event, context }: RaidEventHandlerProps) {
  const { raid } = event.data;
  logger.info(`Raid created: ${raid.id}`, { raid });

  if (raid.status === "SCHEDULED") {
    logger.debug("Raid is scheduled, will be announced later", { raidId: raid.id });
    return;
  }

  if (raid.status === "OPEN") {
    await createOrUpdateAnnouncement({ discord, raidId: event.entityId, serverId: event.serverId, context });
  }
}

export async function handleRaidUpdated({ discord, event, context }: RaidEventHandlerProps) {
  const { raid, previousRaid } = event.data;

  const statusChanged = previousRaid?.status;
  const hasSignUps = previousRaid?.slots;

  logger.info(`Raid updated: ${raid.id}`, {
    raid,
    previousRaid,
    statusChanged,
    hasSignUps,
  });

  if (raid.status === "SCHEDULED") return;

  await createOrUpdateAnnouncement({ discord, raidId: event.entityId, serverId: event.serverId, context });

  // Send thread notification for status changes
  if (statusChanged) {
    if (raid.status === "CANCELLED") {
      await sendThreadUpdate({
        discord,
        raidId: event.entityId,
        updateType: "cancellation",
        data: { reason: "The raid has been cancelled." },
        context,
      });
    } else {
      await sendThreadUpdate({
        discord,
        raidId: event.entityId,
        updateType: "status_change",
        data: { newStatus: raid.status },
        context,
      });
    }
  }

  if (hasSignUps) {
    await sendThreadUpdate({
      discord,
      raidId: event.entityId,
      updateType: "slot_update",
      data: { currentSignups: raid.slots?.filter((slot) => slot.userId).length, totalSlots: raid.slots?.length },
      context,
    });
  }
}

export async function handleRaidDeleted({ discord, event }: RaidEventHandlerProps) {
  const { entityId, serverId, data } = event;
  const announcementMessageId = data.raid.announcementMessageId;

  logger.info(`Raid deleted: ${entityId}`, {
    raidId: entityId,
    serverId,
    hasMessageId: !!announcementMessageId,
  });

  if (!announcementMessageId) {
    logger.debug(`No announcement message ID available for deleted raid: ${entityId}`);
    return;
  }

  deleteAnnouncement({ discord, serverId, announcementMessageId });
}
