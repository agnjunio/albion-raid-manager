import { runInterval } from "@black-river-gaming/common/scheduler";
import { getMilliseconds } from "@black-river-gaming/common/utils";
import logger from "@black-river-gaming/logger";
import config from "config";
import { Client } from "discord.js";
import { Controller } from ".";
import { PurgeConfig } from "../../config/types";

async function purgeOldMessages({ client }: { client: Client }) {
  const purges = config.get<PurgeConfig>("purge");
  if (!purges) return;

  for (const purge of purges) {
    const channel = await client.channels.fetch(purge.channelId);
    if (!channel) continue;
    if (!channel?.isTextBased()) continue;

    const messages = await channel.messages.fetch();
    messages
      .filter((message) => !message.pinned || purge.pinned)
      .filter((message) => new Date().getTime() - message.createdTimestamp > purge.timeout)
      .filter((message) => {
        if (!purge.exceptions || purge.exceptions.length === 0) return true;
        for (const exception of purge.exceptions) {
          switch (exception.type) {
            case "message":
              if (message.id === exception.id) return false;
              continue;
            case "user":
              if (message.author.id === exception.id) return false;
              continue;
            case "role":
              // TODO
              continue;
          }
        }
        return true;
      })
      .each((message) => {
        logger.info(`Deleting message: ${message.id}`, {
          item: message.toJSON(),
        });
        if (message.hasThread && message.thread) message.thread.delete();
        message.delete();
      });
  }
}

const Purge: Controller = {
  name: "Purge",

  init: async (client: Client) => {
    runInterval(
      "Purge Old Messages",
      purgeOldMessages,
      { client },
      {
        interval: getMilliseconds(60, "seconds"),
        runOnStart: true,
      },
    );
  },
};

export default Purge;
