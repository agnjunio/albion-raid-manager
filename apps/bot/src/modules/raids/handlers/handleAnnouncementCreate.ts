import { RaidService, ServersService } from "@albion-raid-manager/core/services";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Client, MessageCreateOptions, MessageEditOptions } from "discord.js";

import { buildRaidAnnouncementMessage } from "../messages";

interface HandleRaidEventProps {
  discord: Client;
  raidId: string;
  serverId: string;
}

export async function handleAnnouncementCreate({ discord, raidId, serverId }: HandleRaidEventProps) {
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
  });

  if (raid.announcementMessageId) {
    const message = await channel.messages.fetch(raid.announcementMessageId);
    if (!message) return;

    await message.edit(buildRaidAnnouncementMessage<MessageEditOptions>(raid, slots));
  } else {
    const message = await channel.send(buildRaidAnnouncementMessage<MessageCreateOptions>(raid, slots));
    await prisma.raid.update({
      where: { id: raid.id },
      data: { announcementMessageId: message.id },
    });
  }
}
