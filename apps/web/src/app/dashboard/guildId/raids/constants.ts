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
    color: "bg-secondary",
  },
  OPEN: {
    icon: faFileContract,
    color: "bg-green-800",
  },
  CLOSED: {
    icon: faTriangleExclamation,
    color: "bg-red-900",
  },
  ONGOING: {
    icon: faPlay,
    color: "bg-primary",
  },
  FINISHED: {
    icon: faStop,
    color: "bg-gray-500",
  },
};
