import { GuildPageProps } from "@/app/guilds/[guildId]/types";
import Card from "@/components/Card";
import { prisma } from "@albion-raid-manager/database";
import CreateRaid from "./CreateRaid";

export default async function CreateRaidPage({ params }: GuildPageProps) {
  const { guildId } = await params;
  const compositions = await prisma.composition.findMany({});

  return (
    <div className="p-4 space-y-2 flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-center">Create Raid</h1>
      <Card className="w-full max-w-lg">
        <CreateRaid id={guildId} compositions={compositions} />
      </Card>
    </div>
  );
}
