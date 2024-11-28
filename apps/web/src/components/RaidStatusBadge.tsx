import { Raid, RaidStatus } from "@albion-raid-manager/database/models";

export default function RaidStatusBadge({ raid }: { raid: Raid }) {
  const statusColors = {
    [RaidStatus.SCHEDULED]: "bg-secondary-violet-800",
    [RaidStatus.OPEN]: "bg-green-800",
    [RaidStatus.CLOSED]: "bg-red-900",
    [RaidStatus.ONGOING]: "bg-primary-yellow-800",
    [RaidStatus.FINISHED]: "bg-primary-gray-500",
  };

  return (
    <div
      className={`select-none w-24 text-center p-1 text-xs uppercase rounded-lg font-semibold shadow-sm ${statusColors[raid.status]}`}
    >
      {raid.status}
    </div>
  );
}
