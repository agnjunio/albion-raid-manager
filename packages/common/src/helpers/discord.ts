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
