import type { RaidStatus } from "@albion-raid-manager/types";

import { RAID_STATUS_INFO } from "@albion-raid-manager/types/entities";
import {
  faFileContract,
  faFilter,
  faHourglassStart,
  faPlay,
  faStop,
  faTriangleExclamation,
  faXmark,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

// Map FontAwesome icons to status info
const statusIcons: Record<RaidStatus, IconDefinition> = {
  SCHEDULED: faHourglassStart,
  OPEN: faFileContract,
  CLOSED: faTriangleExclamation,
  ONGOING: faPlay,
  FINISHED: faStop,
  CANCELLED: faXmark,
};

export const raidStatuses: {
  [key in RaidStatus | "ALL"]: {
    icon: IconDefinition;
    color?: string;
  };
} = {
  ALL: {
    icon: faFilter,
  },
  ...Object.entries(RAID_STATUS_INFO).reduce(
    (acc, [status, info]) => {
      const statusKey = status as RaidStatus;
      acc[statusKey] = {
        icon: statusIcons[statusKey],
        color: `${info.color.web.background} ${info.color.web.text} dark:${info.color.web.background.replace("bg-", "bg-").replace("-500", "-800")} dark:${info.color.web.text}`,
      };
      return acc;
    },
    {} as Record<RaidStatus, { icon: IconDefinition; color: string }>,
  ),
};
