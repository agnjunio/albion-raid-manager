import { APIGuild, APIGuildChannel, APIUser, ChannelType, PermissionFlagsBits } from "discord-api-types/v10";

export const DISCORD_CDN_URL = `https://cdn.discordapp.com`;

export const getDiscordOAuthUrl = (clientId: string, redirectUri: string) =>
  `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;

export const getUserPictureUrl = (id: string, avatar?: string | null) => {
  if (avatar) return `${DISCORD_CDN_URL}/avatars/${id}/${avatar}.png`;
  return `${DISCORD_CDN_URL}/embed/avatars/${Number(id) % 5}.png`;
};

export const getServerPictureUrl = (id: string, icon?: string, { animated = false }: { animated?: boolean } = {}) => {
  if (icon) {
    const ext = animated && icon.startsWith("a_") ? "gif" : "png";
    return `${DISCORD_CDN_URL}/icons/${id}/${icon}.${ext}`;
  }
  return `${DISCORD_CDN_URL}/embed/avatars/${Number(id) % 5}.png`;
};

export const getServerInviteUrl = (clientId: string, serverId?: string) => {
  const serverParam = serverId ? `&guild_id=${serverId}` : ``;
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=2147534848${serverParam}`;
};

export const checkFlag = (bit: string, flag: bigint) => (BigInt(bit) & flag) === flag;

export function transformUser(user: APIUser) {
  return {
    id: user.id,
    username: user.global_name,
    avatar: user.avatar,
    locale: user.locale,
  };
}

export function transformGuild(guild: APIGuild) {
  const transformedGuild = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
    admin: false,
  };

  if (guild.owner) {
    transformedGuild.owner = guild.owner;
  }

  if (guild.permissions) {
    transformedGuild.admin = checkFlag(guild.permissions, PermissionFlagsBits.Administrator);
  }

  return transformedGuild;
}

export function transformChannel(channel: APIGuildChannel<ChannelType>) {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    parentId: channel.parent_id,
  };
}
