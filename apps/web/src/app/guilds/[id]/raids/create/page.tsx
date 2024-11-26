import { PageProps } from "@/app/types";
import { prisma } from "@albion-raid-manager/database";
import CreateRaid from "./CreateRaid";

export default async function CreateRaidPage({ params }: PageProps) {
  const { id } = await params;
  const compositions = await prisma.composition.findMany({});

  return (
    <div className="p-4 space-y-2 flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-center">Create Raid</h1>
      <div className="bg-primary-gray-50/5 w-full max-w-lg p-6 rounded-lg border border-gray-800/5">
        <CreateRaid id={id} compositions={compositions} />
      </div>
    </div>
  );
}
