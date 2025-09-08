import type { RaidStatus } from "@albion-raid-manager/types";

import { cn } from "@/lib/utils";

import { raidStatuses } from "@/lib/constants";

interface Props {
  status: RaidStatus;
}

export function RaidStatusBadge({ status }: Props) {
  return (
    <div
      className={cn(
        `w-24 select-none rounded-lg p-1 text-center text-xs font-semibold uppercase shadow-sm`,
        raidStatuses[status]?.color,
      )}
    >
      {status}
    </div>
  );
}
