import GuildCard from "@/components/guilds/GuildCard";
import { Page, PageTitle } from "@/components/pages/page";
import { nextAuthOptions } from "@/lib/next-auth";
import { prisma } from "@albion-raid-manager/database";
import { getServerSession } from "next-auth";
import { forbidden } from "next/navigation";

export default async function GuildsPage() {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return forbidden();

  const guilds = await prisma.guild.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  return (
    <Page>
      <PageTitle>Select a Guild</PageTitle>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guilds.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}
      </ul>
    </Page>
  );
}
