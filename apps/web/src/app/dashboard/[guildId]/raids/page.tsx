import { Page, PageTitle } from "@/components/ui/page";
import { prisma } from "@albion-raid-manager/database";
import { RaidsProvider } from "./context";
import { RaidList } from "./list";
import { RaidsPageProps } from "./types";

export default async function RaidsPage({ params }: RaidsPageProps) {
  const { guildId } = await params;
  const raids = await prisma.raid.findMany({
    where: {
      guildId: Number(guildId),
    },
  });

  return (
    <RaidsProvider raids={raids}>
      <Page>
        <PageTitle>Raids</PageTitle>
        <RaidList />
      </Page>
    </RaidsProvider>
  );
}
