import { Client, Guild, GuildMember } from "discord.js";

export async function getGuild(client: Client, guildId: string): Promise<Guild> {
  let guild = client.guilds.cache.get(guildId);
  if (!guild) {
    guild = await client.guilds.fetch(guildId);
  }
  return guild;
}

export async function getGuildMember(client: Client, guildId: string, userId: string): Promise<GuildMember> {
  const guild = await getGuild(client, guildId);

  let member = guild.members.cache.get(userId);
  if (!member || member.pending) {
    member = await guild.members.fetch(userId);
  }
  return member;
}
