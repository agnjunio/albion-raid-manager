// Browser-compatible Discord utilities
// These are extracted from @albion-raid-manager/core/utils/discord to avoid Node.js dependencies

export const DISCORD_CDN_URL = `https://cdn.discordapp.com`;

export const PERMISSIONS: {
  [permission: string]: bigint;
} = {
  ADMINISTRATOR: BigInt(1 << 3), // 0x00000008
  MANAGE_GUILD: BigInt(1 << 5), // 0x00000020
  MANAGE_ROLES: BigInt(1 << 28), // 0x10000000
};

export const getDiscordOAuthUrl = (
  clientId: string,
  redirectUri: string,
  scopes: string[] = ["identify", "guilds", "guilds.members.read"],
) => {
  const scope = encodeURI(scopes.join("+"));
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
};

export const getUserPictureUrl = (id: string, avatar?: string | null) => {
  if (avatar) return `${DISCORD_CDN_URL}/avatars/${id}/${avatar}.png`;
  return `${DISCORD_CDN_URL}/embed/avatars/${Number(id) % 5}.png`;
};

export const getServerPictureUrl = (
  id: string,
  icon?: string | null,
  { animated = false }: { animated?: boolean } = {},
) => {
  if (icon) {
    const ext = animated && icon.startsWith("a_") ? "gif" : "png";
    return `${DISCORD_CDN_URL}/icons/${id}/${icon}.${ext}`;
  }
  return `${DISCORD_CDN_URL}/embed/avatars/${Number(id) % 5}.png`;
};

export const getServerInviteUrl = (clientId: string, serverId?: string) => {
  const serverParam = serverId ? `&guild_id=${serverId}` : ``;
  return `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=8${serverParam}`;
};

export function hasPermissions(permissions: string | bigint = 0n, requiredPermissions: bigint[]): boolean {
  const permissionBits = BigInt(permissions);
  return requiredPermissions.every((perm) => (permissionBits & perm) !== 0n);
}

export function createDiscordTimestamp(date: Date): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:R>`;
}

export function createDiscordTimestampWithFormat(
  date: Date,
  format: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "R",
): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${format}>`;
}
