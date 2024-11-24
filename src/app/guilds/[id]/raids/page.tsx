import { prisma } from "@lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

type GuildPageParams = {
  params: Promise<{
    id: string;
  }>;
};

export default async function GuildPage({ params }: GuildPageParams) {
  const { id } = await params;
  const guild = await prisma.guild.findUnique({
    where: {
      id: Number(id),
    },
    include: { raids: true },
  });

  if (!guild) {
    redirect("/guilds");
  }

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-semibold text-center">{guild.name}</h1>

      <div className="flex gap-2">
        <Link href={`/guilds/${id}/raids/create`}>
          <button>Create Raid</button>
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-center">Raids</h2>
      <ul className="space-y-2">
        {guild.raids.map((raid) => (
          <li key={raid.id} className="border p-2 rounded">
            <h3 className="text-lg font-semibold">{raid.description}</h3>
            <p>{new Date(raid.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
