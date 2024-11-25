import { Guild } from "@albion-raid-manager/database";
import { prisma } from "@lib/prisma";
import GuildCard from "./GuildCard";

export default async function GuildsPage() {
  const guilds: Guild[] = await prisma.guild.findMany();

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-semibold text-center">Guilds</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guilds.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}
      </ul>
    </div>
  );
}
