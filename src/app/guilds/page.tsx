import { prisma } from "@lib/prisma";

export default async function GuildsPage() {
  const guilds = await prisma.guild.findMany();

  return (
    <div>
      <h1>Guilds</h1>
      <ul>
        {guilds.map((guild) => (
          <li key={guild.id}>{guild.name}</li>
        ))}
      </ul>
    </div>
  );
}
