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
    textColor?: string;
    label: string;
    emoji: string;
  };
} = {
  ALL: {
    icon: faFilter,
    label: "All",
    emoji: "🔍",
  },
  SCHEDULED: {
    icon: statusIcons.SCHEDULED,
    color:
      "bg-raid-status-scheduled-600 dark:bg-raid-status-scheduled-500 hover:bg-raid-status-scheduled-700 dark:hover:bg-raid-status-scheduled-600 text-white border-raid-status-scheduled-200 dark:border-raid-status-scheduled-950",
    textColor: "text-raid-status-scheduled-500 dark:text-raid-status-scheduled-400",
    label: RAID_STATUS_INFO.SCHEDULED.label,
    emoji: RAID_STATUS_INFO.SCHEDULED.emoji,
  },
  OPEN: {
    icon: statusIcons.OPEN,
    color:
      "bg-raid-status-open-600 dark:bg-raid-status-open-500 hover:bg-raid-status-open-700 dark:hover:bg-raid-status-open-600 text-white border-raid-status-open-200 dark:border-raid-status-open-950",
    textColor: "text-raid-status-open-500 dark:text-raid-status-open-400",
    label: RAID_STATUS_INFO.OPEN.label,
    emoji: RAID_STATUS_INFO.OPEN.emoji,
  },
  CLOSED: {
    icon: statusIcons.CLOSED,
    color:
      "bg-raid-status-closed-600 dark:bg-raid-status-closed-500 hover:bg-raid-status-closed-700 dark:hover:bg-raid-status-closed-600 text-white border-raid-status-closed-200 dark:border-raid-status-closed-950",
    textColor: "text-raid-status-closed-500 dark:text-raid-status-closed-400",
    label: RAID_STATUS_INFO.CLOSED.label,
    emoji: RAID_STATUS_INFO.CLOSED.emoji,
  },
  ONGOING: {
    icon: statusIcons.ONGOING,
    color:
      "bg-raid-status-ongoing-600 dark:bg-raid-status-ongoing-500 hover:bg-raid-status-ongoing-700 dark:hover:bg-raid-status-ongoing-600 text-white border-raid-status-ongoing-200 dark:border-raid-status-ongoing-950",
    textColor: "text-raid-status-ongoing-500 dark:text-raid-status-ongoing-400",
    label: RAID_STATUS_INFO.ONGOING.label,
    emoji: RAID_STATUS_INFO.ONGOING.emoji,
  },
  FINISHED: {
    icon: statusIcons.FINISHED,
    color:
      "bg-raid-status-finished-600 dark:bg-raid-status-finished-500 hover:bg-raid-status-finished-700 dark:hover:bg-raid-status-finished-600 text-white border-raid-status-finished-200 dark:border-raid-status-finished-950",
    textColor: "text-raid-status-finished-500 dark:text-raid-status-finished-400",
    label: RAID_STATUS_INFO.FINISHED.label,
    emoji: RAID_STATUS_INFO.FINISHED.emoji,
  },
  CANCELLED: {
    icon: statusIcons.CANCELLED,
    color:
      "bg-raid-status-cancelled-600 dark:bg-raid-status-cancelled-500 hover:bg-raid-status-cancelled-700 dark:hover:bg-raid-status-cancelled-600 text-white border-raid-status-cancelled-200 dark:border-raid-status-cancelled-950",
    textColor: "text-raid-status-cancelled-500 dark:text-raid-status-cancelled-400",
    label: RAID_STATUS_INFO.CANCELLED.label,
    emoji: RAID_STATUS_INFO.CANCELLED.emoji,
  },
};
