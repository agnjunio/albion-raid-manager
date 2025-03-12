import { Page, PageTitle } from "@/components/ui/page";
import { prisma } from "@albion-raid-manager/database";
import { RaidsPageProps } from "../types";
import CreateRaid from "./create";

export default async function CreateRaidPage({ params }: RaidsPageProps) {
  const { guildId } = await params;
  const compositions = await prisma.composition.findMany({});

  return (
    <Page>
      <PageTitle>New Raid</PageTitle>

      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <CreateRaid guildId={guildId} compositions={compositions} />
        </div>
      </div>
    </Page>
  );
}
