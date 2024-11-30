import { GuildPageProps } from "@/app/guilds/[guildId]/types";
import Card from "@/components/Card";
import { prisma } from "@albion-raid-manager/database";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import CreateRaid from "./CreateRaid";

export default async function CreateRaidPage({ params }: GuildPageProps) {
  const { guildId } = await params;
  const compositions = await prisma.composition.findMany({});

  return (
    <div className="p-4 space-y-2 flex flex-col items-center">
      <div className="self-start">
        <Link tabIndex={-1} href={`/guilds/${guildId}/raids`}>
          <button role="icon-button">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </Link>
      </div>

      <h2 className="text-2xl font-semibold text-center py-4">Create Raid</h2>

      <Card className="w-full max-w-lg">
        <CreateRaid id={guildId} compositions={compositions} />
      </Card>
    </div>
  );
}
