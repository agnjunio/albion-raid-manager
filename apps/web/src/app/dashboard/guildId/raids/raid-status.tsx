import type { RaidStatus } from "@albion-raid-manager/core/types";

import { cn } from "@albion-raid-manager/core/helpers/classNames";

import { raidStatuses } from "./constants";

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
