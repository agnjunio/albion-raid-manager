import { prisma } from "@albion-raid-manager/database";
import { Guild } from "@albion-raid-manager/database/models";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { nextAuthOptions } from "../lib/next-auth";
import GuildCard from "./GuildCard";

export default async function GuildsPage() {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return redirect("/");

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
