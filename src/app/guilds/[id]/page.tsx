import { prisma } from "@lib/prisma";

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
    return <div>Guild not found</div>;
  }

  return (
    <div className="p-4 space-y-2">
      <h1 className="text-2xl font-semibold text-center">{guild.name}</h1>
      <h2 className="text-xl font-semibold">Raids</h2>
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
