import { transformChannel, transformGuild, transformUser } from "@/helpers/discord";
import { memoize } from "@albion-raid-manager/common/helpers/cache";
import { sleep } from "@albion-raid-manager/common/scheduler";
import { getMilliseconds } from "@albion-raid-manager/common/utils/time";
import config from "@albion-raid-manager/config";
import * as discordApiClient from "../clients/discord";

const DISCORD_TOKEN = config.discord.token;

export async function getCurrentUser(token: string) {
  return memoize(
    `discord.users.${token}`,
    async () => {
      const user = await discordApiClient.getCurrentUser(`Bearer ${token}`);
      return transformUser(user);
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

export async function getUser(userId: string) {
  return memoize(
    `discord.users.${userId}`,
    async () => {
      const user = await discordApiClient.getUser(`Bot ${DISCORD_TOKEN}`, userId);
      return transformUser(user);
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

export async function getUserGuilds(token: string, params: unknown) {
  return memoize(
    `discord.users.${token}.guilds`,
    async () => {
      const guilds = await discordApiClient.getCurrentUserGuilds(`Bearer ${token}`, params);
      return guilds.map(transformGuild);
    },
    {
      timeout: getMilliseconds(1, "minutes"),
    },
  );
}

export async function getBotGuilds() {
  return memoize(
    `discord.botGuilds`,
    async () => {
      let foundAll = false;
      let after;
      const guilds = [];

      // Iterate over all pages of guilds because bot can join more than the default 200 servers limit
      while (!foundAll) {
        const guildList = await discordApiClient.getCurrentUserGuilds(`Bot ${DISCORD_TOKEN}`, { limit: 200, after });
        guilds.push(...guildList);

        after = guilds[guilds.length - 1].id;
        if (guildList.length < 200) foundAll = true;
        else await sleep(2000);
      }

      return guilds.map(transformGuild);
    },
    {
      refresh: getMilliseconds(10, "minutes"),
    },
  );
}

export async function getGuild(guildId: string) {
  return memoize(
    `discord.guilds.${guildId}`,
    async () => {
      const guild = await discordApiClient.getGuild(`Bot ${DISCORD_TOKEN}`, guildId);
      return transformGuild(guild);
    },
    {
      timeout: getMilliseconds(1, "days"),
    },
  );
}

export async function getGuildChannels(guildId: string) {
  return memoize(
    `discord.guilds.${guildId}.channels`,
    async () => {
      const channels = await discordApiClient.getGuildChannels(`Bot ${DISCORD_TOKEN}`, guildId);
      return channels.map(transformChannel);
    },
    {
      timeout: getMilliseconds(30, "seconds"),
    },
  );
}

export async function leaveGuild(guildId: string) {
  await discordApiClient.leaveGuild(`Bot ${DISCORD_TOKEN}`, guildId);
  return true;
}

export const addMemberRole = (guildId: string, memberId: string, roleId: string, reason: string) => {
  return discordApiClient.addGuildMemberRole(`Bot ${DISCORD_TOKEN}`, {
    guildId,
    memberId,
    roleId,
    reason,
  });
};

export const removeMemberRole = (guildId: string, memberId: string, roleId: string, reason: string) => {
  return discordApiClient.removeGuildMemberRole(`Bot ${DISCORD_TOKEN}`, {
    guildId,
    memberId,
    roleId,
    reason,
  });
};

type File = {
  id: number;
  name: string;
  description: string;
  image: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendMessage = (channelId: string, payload: any) => {
  if (!payload) throw new Error("Empty message");

  // If we have files (generated by embeds helper), transform them to attachments
  const files: File[] = [];
  if (payload.files && payload.files.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload.files.forEach((file: any, i: number) => {
      files.push({
        id: i,
        description: file.description,
        name: file.name,
        image: file.attachment,
      });
    });
    delete payload.files;
    payload.attachments = files.map((file) => ({
      id: file.id,
      description: file.description,
      name: file.name,
    }));
  }

  return discordApiClient.createMessage(`Bot ${DISCORD_TOKEN}`, channelId, { payload, files });
};
