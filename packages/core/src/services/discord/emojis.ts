import { memoize } from "@albion-raid-manager/core/cache/memory";
import config from "@albion-raid-manager/core/config";
import { getAuthorization } from "@albion-raid-manager/core/utils/discord";
import { getMilliseconds } from "@albion-raid-manager/core/utils/time";

import { discordApiClient } from "./client";
import { APIEmoji, DiscordServiceOptions } from "./types";

interface GetApplicationEmojisOptions extends DiscordServiceOptions {}

export async function getApplicationEmojis(
  applicationId: string,
  { type = "bot", token = config.discord.token }: GetApplicationEmojisOptions,
) {
  const emojis = await memoize<APIEmoji[]>(
    `discord.${type}.${token}.applications.${applicationId}.emojis`,
    async () => {
      const res = await discordApiClient.get(`/applications/${applicationId}/emojis`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data?.items ?? [];
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
  return emojis;
}
