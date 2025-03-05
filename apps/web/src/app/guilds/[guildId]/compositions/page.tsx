"use server";

import CompositionList from "@/components/compositions/CompositionList";
import Page from "@/components/pages/Page";
import PageTitle from "@/components/pages/PageTitle";
import { prisma } from "@albion-raid-manager/database";
import { CompositionPageProps } from "./types";

export default async function CompositionsPage({ params }: CompositionPageProps) {
  const { guildId } = await params;

  const compositions = await prisma.composition.findMany({
    where: {
      guildId: Number(guildId),
    },
    include: {
      _count: {
        select: {
          slots: true,
        },
      },
    },
  });

  return (
    <Page>
      <PageTitle>Compositions</PageTitle>

      <CompositionList compositions={compositions} />
    </Page>
  );
}
