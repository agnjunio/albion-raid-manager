import { runCronjob } from "@albion-raid-manager/common/scheduler";
import { prisma } from "@albion-raid-manager/database";
import logger from "@albion-raid-manager/logger";
import { Client } from "discord.js";
import { Controller } from ".";

const announceRaids = async ({ discord }: { discord: Client }) => {
  logger.info("Checking for raid announcements");

  const raids = await prisma.raid.findMany({});
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
