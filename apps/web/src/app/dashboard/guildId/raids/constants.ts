import type { RaidStatus } from "@albion-raid-manager/core/types";

import {
  faFileContract,
  faFilter,
  faHourglassStart,
  faPlay,
  faStop,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export const raidStatuses: {
  [key in RaidStatus | "ALL"]: {
    icon: IconDefinition;
    color?: string;
  };
} = {
  ALL: {
    icon: faFilter,
  },
  SCHEDULED: {
    icon: faHourglassStart,
    color: "bg-blue-500 text-blue-100 dark:bg-blue-800 dark:text-blue-100",
  },
  OPEN: {
    icon: faFileContract,
    color: "bg-green-500 text-green-100 dark:bg-green-800 dark:text-green-100",
  },
  CLOSED: {
    icon: faTriangleExclamation,
    color: "bg-red-500 text-red-100 dark:bg-red-800 dark:text-red-100",
  },
  ONGOING: {
    icon: faPlay,
    color: "bg-yellow-500 text-yellow-100 dark:bg-yellow-800 dark:text-yellow-100",
  },
  FINISHED: {
    icon: faStop,
    color: "bg-gray-500 text-gray-100 dark:bg-gray-800 dark:text-gray-100",
  },
};
