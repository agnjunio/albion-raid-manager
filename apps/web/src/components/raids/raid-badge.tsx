import type { RaidStatus } from "@albion-raid-manager/types";

import { useTranslation } from "react-i18next";

import { raidStatuses } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  status: RaidStatus;
}

export function RaidStatusBadge({ status }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        `w-24 select-none rounded-lg p-1 text-center text-xs font-semibold uppercase shadow-sm`,
        raidStatuses[status]?.color,
      )}
    >
      {t(`raids.raidStatus.${status.toLowerCase()}`) || status}
    </div>
  );
}
