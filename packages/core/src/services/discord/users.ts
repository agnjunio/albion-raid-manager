import { APIUser } from "discord-api-types/v10";

import { memoize } from "@albion-raid-manager/core/cache/memory";
import config from "@albion-raid-manager/core/config";
import { getAuthorization } from "@albion-raid-manager/core/utils/discord";
import { getMilliseconds } from "@albion-raid-manager/core/utils/time";

import { discordApiClient } from "./client";
import { DiscordServiceOptions } from "./types";

export async function getCurrentUser({ type = "bot", token = config.discord.token }: DiscordServiceOptions) {
  return memoize<APIUser>(
    `discord.users.${type}.${token}`,
    async () => {
      const res = await discordApiClient.get<APIUser>(`/users/@me`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

export async function getUser(userId: string, { type = "bot", token = config.discord.token }: DiscordServiceOptions) {
  return memoize<APIUser>(
    `discord.users.${type}.${token}.${userId}`,
    async () => {
      const res = await discordApiClient.get<APIUser>(`/users/${userId}`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}
