import { logger } from "@albion-raid-manager/core/logger";

import { createOrUpdateAnnouncement, deleteAnnouncement } from "../announcements";

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

  logger.info(`Raid updated: ${raid.id}`, {
    raid,
    previousRaid,
    statusChanged: previousRaid?.status !== raid.status,
  });

  if (raid.status === "SCHEDULED") return;

  await createOrUpdateAnnouncement({ discord, raidId: event.entityId, serverId: event.serverId, context });
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

  deleteAnnouncement({ discord, raidId: entityId });
}
