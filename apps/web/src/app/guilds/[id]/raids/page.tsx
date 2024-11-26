import { PageProps } from "@/app/types";
import { prisma } from "@albion-raid-manager/database";
import Link from "next/link";

export default async function GuildPage({ params }: PageProps) {
  const { id } = await params;
  const raids = await prisma.raid.findMany({
    where: {
      guildId: Number(id),
    },
  });

  return (
    <div className="p-4 space-y-2">
      <div className="flex gap-2 flex-row-reverse">
        <Link href="raids/create">
          <button>Create Raid</button>
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-center">Raids</h2>
      <ul className="space-y-2">
        {raids.map((raid) => (
          <li key={raid.id} className="border p-2 rounded">
            {raid.status}
            <h3 className="text-lg font-semibold">{raid.description}</h3>
            <p>{new Date(raid.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
