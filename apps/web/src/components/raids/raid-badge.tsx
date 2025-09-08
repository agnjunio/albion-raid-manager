import type { RaidStatus } from "@albion-raid-manager/types";

import { raidStatuses } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
