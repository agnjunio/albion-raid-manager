import { getErrorMessage } from "@albion-raid-manager/core/utils/errors";
import { prisma, RaidStatus } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { Client, MessageCreateOptions } from "discord.js";

import { raidEvents } from "../events";
import { buildRaidAnnouncementMessage } from "../messages";

export const handleAnnounceRaids = async ({ discord }: { discord: Client }) => {
  logger.verbose("Checking for raid announcements");

  const raids = await prisma.raid.findMany({
    where: {
      status: RaidStatus.SCHEDULED,
    },
    include: {
      guild: true,
      slots: true,
    },
  });
  if (!raids.length) return;

  logger.debug(`Announcing ${raids.length} scheuled raids.`, {
    raids: raids.length,
  });

  for (const raid of raids) {
    try {
      logger.info(`Announcing raid: ${raid.id}`, { raid });

      await prisma.raid.update({
        where: { id: raid.id },
        data: { status: RaidStatus.OPEN },
      });

      if (!raid.guild.raidAnnouncementChannelId)
        throw new Error(`Announcement channel not set for guild: ${raid.guild.name}`);

      const guild = discord.guilds.cache.get(raid.guild.discordId);
      if (!guild) throw new Error(`Discord guild not found: ${raid.guild.discordId}`);

      const channel = await guild.channels.fetch(raid.guild.raidAnnouncementChannelId);
      if (!channel) throw new Error(`Announcement channel not found: ${raid.guild.raidAnnouncementChannelId}`);
      if (!channel.isTextBased())
        throw new Error(`Announcement channel is not a text channel: ${raid.guild.raidAnnouncementChannelId}`);

      const message = await channel.send(buildRaidAnnouncementMessage<MessageCreateOptions>(raid, raid.slots));

      await prisma.raid.update({
        where: { id: raid.id },
        data: { announcementMessageId: message.id },
      });
      raidEvents.emit("raidAnnounced", raid);
    } catch (error) {
      logger.warn(`Failed to announce raid: ${raid.id} (${getErrorMessage(error)})`, {
        raid,
        guild: raid.guild,
        error,
      });
    }
  }
};
