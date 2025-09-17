import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { RaidService, ServersService } from "@albion-raid-manager/core/services";
import { Client, Message, MessageCreateOptions, MessageEditOptions } from "discord.js";

import { GuildContext } from "@/modules/guild-context";

import { buildRaidAnnouncementMessage } from "../messages";

import { createNotificationThread } from "./notifications";

interface CreateOrUpdateAnnouncementProps {
  discord: Client;
  raidId: string;
  serverId: string;
  context: GuildContext;
}

export async function createOrUpdateAnnouncement({
  discord,
  raidId,
  serverId,
  context,
}: CreateOrUpdateAnnouncementProps) {
  const raid = await RaidService.findRaidById(raidId, { slots: true });

  if (!raid) {
    logger.warn(`Raid not found: ${raidId}`, { raidId });
    return;
  }

  const server = await ServersService.getServerById(serverId);
  if (!server || !server.raidAnnouncementChannelId) return;

  const channel = discord.channels.cache.get(server.raidAnnouncementChannelId);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

  const slots = await prisma.raidSlot.findMany({
    where: { raidId: raid.id },
    orderBy: { order: "asc" },
  });

  let message: Message | undefined;

  if (raid.announcementMessageId) {
    message = await channel.messages.fetch(raid.announcementMessageId);
    if (!message) return;

    await message.edit(await buildRaidAnnouncementMessage<MessageEditOptions>(raid, slots, { discord, context }));
  } else {
    message = await channel.send(
      await buildRaidAnnouncementMessage<MessageCreateOptions>(raid, slots, { discord, context }),
    );

    await prisma.raid.update({
      where: { id: raid.id },
      data: {
        announcementMessageId: message.id,
      },
    });
  }

  if (!message.hasThread) {
    await createNotificationThread({ discord, message, raid, context });
  }
}
