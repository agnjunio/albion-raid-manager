import { runCronjob } from "@albion-raid-manager/common/scheduler";
import logger from "@albion-raid-manager/logger";
import { Client } from "discord.js";
import { Controller } from ".";

const announceRaids = async ({ client }: { client: Client }) => {
  logger.info("Running the daily   cronjob");
};

const Raids: Controller = {
  name: "Raids",
  init: async (client: Client) => {
    runCronjob({
      name: "Announce Raids",
      cron: "0 0 * * *",
      callback: () => announceRaids({ client }),
      runOnStart: true,
    });
  },
};

export default Raids;
