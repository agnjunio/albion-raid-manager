import { prisma } from "@/lib/prisma";
import CreateRaid from "./CreateRaid";

type CreateRaidPageParams = {
  params: {
    id: string;
  };
};

export default async function CreateRaidPage({ params }: CreateRaidPageParams) {
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
