/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const CHANNEL_TYPES = {
  TEXT: 0,
};

// TODO: Move this to a suitable place
export function transformUser(user: any) {
  return {
    id: user.id,
    username: user.global_name,
    avatar: user.avatar,
    locale: user.locale,
  };
}

export function transformGuild(guild: any) {
  const transformedGuild = {
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    owner: guild.owner,
  } as any;

  if (guild.owner) {
    transformedGuild.owner = guild.owner;
  }

  // FIXME
  // if (guild.permissions) {
  //   transformedGuild.admin = isServerAdmin(guild.permissions);
  // }

  return transformedGuild;
}

export function transformChannel(channel: any) {
  return {
    id: channel.id,
    name: channel.name,
    type: channel.type,
    parentId: channel.parent_id,
  };
}
