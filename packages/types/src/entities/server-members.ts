import { APIGuildMember } from "discord-api-types/v10";

import { ServerMember as DBServerMember } from "@albion-raid-manager/types";

export type ServerMember = DBServerMember & {
  username: string;
  avatar: string | null;
  registered?: boolean;
  roles: APIGuildMember["roles"];
};

export function fromDiscordMember(member: APIGuildMember, data?: Partial<DBServerMember>): ServerMember {
  return {
    serverId: data?.serverId || "",
    userId: data?.userId || member.user.id,
    username: member.user.username || data?.user?.username || "",
    nickname: member.nick || member.user.global_name || data?.nickname || null,
    avatar: member.avatar || member.user.avatar,
    roles: member.roles,
    registered: data?.albionPlayerId ? true : false,
    albionPlayerId: data?.albionPlayerId || null,
    albionGuildId: data?.albionGuildId || null,
    killFame: data?.killFame || 0,
    deathFame: data?.deathFame || 0,
    lastUpdated: data?.lastUpdated || new Date(),
  };
}
