import { APIGuildMember } from "discord-api-types/v10";

import { ServerMember as DBServerMember } from "@albion-raid-manager/types";

export type ServerMember = DBServerMember & {
  roles: APIGuildMember["roles"];
};

export function fromDiscordMember(member: APIGuildMember, data?: Partial<DBServerMember>): ServerMember {
  return {
    serverId: data?.serverId || "",
    userId: data?.userId || member.user.id,
    nickname: data?.nickname || member.nick,
    killFame: data?.killFame || 0,
    deathFame: data?.deathFame || 0,
    lastUpdated: data?.lastUpdated || new Date(),
    roles: member.roles,
  };
}
