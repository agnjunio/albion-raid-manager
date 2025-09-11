import config from "@albion-raid-manager/config";
import { APIGuild, APIGuildChannel, APIGuildMember, ChannelType, PermissionFlagsBits } from "discord-api-types/v10";

import { memoize } from "@albion-raid-manager/core/cache/memory";
import { sleep } from "@albion-raid-manager/core/scheduler";
import { getMilliseconds } from "@albion-raid-manager/core/utils";
import {
  getAuthorization,
  hasPermissions,
  transformChannel,
  transformGuild,
} from "@albion-raid-manager/core/utils/discord";

import { discordApiClient } from "./client";
import { DiscordServiceOptions } from "./types";

type GetUserGuildsOptions = DiscordServiceOptions & {
  admin?: boolean;
};

export async function getServers({ admin, type = "bot", token = config.discord.token }: GetUserGuildsOptions) {
  const servers = await memoize<APIGuild[]>(
    `discord.${type}.${token}.guilds`,
    async () => {
      let foundAll = false;
      let after;
      const servers: APIGuild[] = [];

      // Iterate over all pages of guilds because bot can join more than the default 200 servers limit
      while (!foundAll) {
        const res = await discordApiClient.get<APIGuild[]>("/users/@me/guilds", {
          headers: {
            Authorization: getAuthorization(type, token),
          },
          params: { limit: 200, after },
        });

        servers.push(...res.data);
        after = servers[servers.length - 1].id;

        if (res.data.length < 200) {
          foundAll = true;
        } else {
          await sleep(2000);
        }
      }

      return servers;
    },
    {
      refresh: getMilliseconds(10, "minutes"),
    },
  );

  return servers
    .filter((server) => {
      if (!admin) return true;
      return hasPermissions(server.permissions, [PermissionFlagsBits.Administrator]);
    })
    .map(transformGuild);
}

export async function getServer(
  serverId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  const server = await memoize<APIGuild>(
    `discord.${type}.${token}.guilds.${serverId}`,
    async () => {
      const res = await discordApiClient.get<APIGuild>(`/guilds/${serverId}`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
        params: {
          with_counts: true,
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
  return transformGuild(server);
}

export async function getServerChannels(
  serverId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize(
    `discord.${type}.${token}.guilds.${serverId}.channels`,
    async () => {
      const res = await discordApiClient.get<APIGuildChannel<ChannelType.GuildText>[]>(`/guilds/${serverId}/channels`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data.map(transformChannel);
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function leaveServer(
  serverId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  const res = await discordApiClient.delete(`/users/@me/guilds/${serverId}`, {
    headers: {
      Authorization: getAuthorization(type, token),
    },
  });
  return res.data;
}

export async function getServerMembers(
  guildId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize<APIGuildMember[]>(
    `discord.${type}.${token}.guilds.${guildId}.members`,
    async () => {
      const res = await discordApiClient.get<APIGuildMember[]>(`/guilds/${guildId}/members`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
        params: {
          limit: 1000, // TODO: Paginate
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function getServerMember(
  guildId: string,
  userId: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions = {},
) {
  return memoize<APIGuildMember>(
    `discord.${type}.${token}.guilds.${guildId}.members.${userId}`,
    async () => {
      const res = await discordApiClient.get<APIGuildMember>(`/guilds/${guildId}/members/${userId}`, {
        headers: {
          Authorization: getAuthorization(type, token),
        },
      });
      return res.data;
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export const addServerMemberRole = async (
  guildId: string,
  memberId: string,
  roleId: string,
  reason: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions,
) => {
  const res = await discordApiClient.put(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, null, {
    headers: {
      Authorization: getAuthorization(type, token),
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
};

export const removeServerMemberRole = async (
  guildId: string,
  memberId: string,
  roleId: string,
  reason: string,
  { type = "bot", token = config.discord.token }: DiscordServiceOptions,
) => {
  const res = await discordApiClient.delete(`/guilds/${guildId}/members/${memberId}/roles/${roleId}`, {
    headers: {
      Authorization: getAuthorization(type, token),
      "X-Audit-Log-Reason": reason,
    },
  });
  return res.data;
};
