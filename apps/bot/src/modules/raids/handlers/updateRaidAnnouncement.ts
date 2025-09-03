import { Raid } from "@albion-raid-manager/core/types";
import { prisma } from "@albion-raid-manager/database";
import { Client, MessageEditOptions } from "discord.js";

import { buildRaidAnnouncementMessage } from "../messages";

export const updateRaidAnnouncement = async (discord: Client, raid: Raid) => {
  if (!raid.announcementMessageId) return;

  const server = await prisma.server.findUnique({
    where: { id: raid.serverId },
  });
  if (!server || !server.raidAnnouncementChannelId) return;

  const channel = discord.channels.cache.get(server.raidAnnouncementChannelId);
  if (!channel?.isTextBased()) return;

  const message = await channel.messages.fetch(raid.announcementMessageId);
  if (!message) return;

  const slots = await prisma.raidSlot.findMany({
    where: { raidId: raid.id },
  });
  await message.edit(buildRaidAnnouncementMessage<MessageEditOptions>(raid, slots));
};
