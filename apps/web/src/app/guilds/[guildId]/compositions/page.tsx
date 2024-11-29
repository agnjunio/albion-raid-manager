"use server";

import { prisma } from "@albion-raid-manager/database";
import { CompositionPageProps } from "./types";

export default async function CompositionsPage({ params }: CompositionPageProps) {
  const { guildId } = await params;

  const compositions = await prisma.composition.findMany({
    where: {
      guildId: Number(guildId),
    },
  });

  return (
    <div className="grow h-full flex flex-col px-4">
      <h2 className="text-2xl font-semibold text-center py-4">Compositions</h2>

      {/* <CompositionList compositions={compositions} */}
      {compositions.length}
    </div>
  );
}
