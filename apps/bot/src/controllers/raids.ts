import { Controller } from "@/controllers";
import { getEmbedRaidAnnouncement } from "@/embeds/raids";
import { runCronjob } from "@albion-raid-manager/common/scheduler";
import { getErrorMessage } from "@albion-raid-manager/common/utils";
import { prisma } from "@albion-raid-manager/database";
import { RaidStatus } from "@albion-raid-manager/database/models";
import logger from "@albion-raid-manager/logger";
import { differenceInMinutes } from "date-fns";
import { Client } from "discord.js";

const announceRaids = async ({ discord }: { discord: Client }) => {
  logger.verbose("Checking for raid announcements");

  const now = new Date();
  const raids = await prisma.raid
    .findMany({
      where: {
        status: RaidStatus.SCHEDULED,
      },
      include: {
        guild: true,
      },
    })
    .then((raids) => {
      return raids.filter((raid) => {
        return differenceInMinutes(new Date(raid.date), now) < 30;
      });
    });
  if (!raids.length) return;

  logger.debug(`Announcing ${raids.length} scheuled raids.`, {
    raids: raids.length,
  });

  for (const raid of raids) {
    try {
      logger.info(`Announcing raid: ${raid.id}`, { raid });

      // await prisma.raid.update({
      //   where: { id: raid.id },
      //   data: { status: RaidStatus.OPEN },
      // });

      if (!raid.guild.announcementChannelId)
        throw new Error(`Announcement channel not set for guild: ${raid.guild.name}`);

      const guild = discord.guilds.cache.get(raid.guild.discordId);
      if (!guild) throw new Error(`Discord guild not found: ${raid.guild.discordId}`);

      const channel = await guild.channels.fetch(raid.guild.announcementChannelId);
      if (!channel) throw new Error(`Announcement channel not found: ${raid.guild.announcementChannelId}`);
      if (!channel.isTextBased())
        throw new Error(`Announcement channel is not a text channel: ${raid.guild.announcementChannelId}`);

      await channel.send({ embeds: [getEmbedRaidAnnouncement(raid)] });
    } catch (error) {
      logger.warn(`Failed to announce raid: ${raid.id} (${getErrorMessage(error)})`, {
        raid,
        guild: raid.guild,
        error,
      });
    }
  }
};

const Raids: Controller = {
  name: "Raids",
  init: async (discord: Client) => {
    runCronjob({
      name: "Announce Raids",
      cron: "*/30 * * * *", // Every 30 minutes
      callback: () => announceRaids({ discord }),
      runOnStart: true,
    });
  },
};

export default Raids;
