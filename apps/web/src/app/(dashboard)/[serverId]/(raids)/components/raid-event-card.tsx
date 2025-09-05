import type { Raid } from "@albion-raid-manager/core/types";

import { cn } from "@albion-raid-manager/core/helpers";
import { faCheck, faMapMarkerAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { RaidStatusBadge } from "@/components/raids/raid-badge";

interface RaidEventCardProps {
  raid: Raid;
  variant?: "default" | "compact" | "time-slot";
  className?: string;
}

export function RaidEventCard({ raid, variant = "default", className }: RaidEventCardProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
      case "OPEN":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800";
      case "CLOSED":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
      case "ONGOING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
      case "FINISHED":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return "p-1 text-xs";
      case "time-slot":
        return "p-2 text-sm";
      default:
        return "p-3 text-sm";
    }
  };

  if (variant === "compact") {
    return (
      <Link
        to={raid.id}
        className={cn(
          "hover:bg-accent/50 block rounded border-l-2 transition-colors",
          getStatusColor(raid.status),
          getVariantStyles(),
          className,
        )}
      >
        <div className="truncate font-medium">{raid.title}</div>
        <div className="text-xs opacity-75">{formatTime(raid.date)}</div>
      </Link>
    );
  }

  if (variant === "time-slot") {
    return (
      <Link
        to={raid.id}
        className={cn(
          "hover:bg-accent/50 block rounded border-l-2 transition-colors",
          getStatusColor(raid.status),
          getVariantStyles(),
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <div className="truncate font-medium">{raid.title}</div>
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
          </div>
        </div>
        <div className="text-xs opacity-75">{formatTime(raid.date)}</div>
        {raid.location && (
          <div className="flex items-center gap-1 text-xs opacity-75">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3" />
            <span className="truncate">{raid.location}</span>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={raid.id}
      className={cn(
        "block rounded-lg border transition-all hover:shadow-md",
        getStatusColor(raid.status),
        getVariantStyles(),
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="truncate font-semibold">{raid.title}</h3>
            <RaidStatusBadge status={raid.status} />
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="h-3 w-3 opacity-75" />
              <span className="opacity-75">{formatTime(raid.date)}</span>
            </div>

            {raid.location && (
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 opacity-75" />
                <span className="truncate opacity-75">{raid.location}</span>
              </div>
            )}

            {raid.description && <p className="line-clamp-2 text-xs opacity-75">{raid.description}</p>}
          </div>
        </div>

        <div className="ml-2 flex items-center gap-1">
          <FontAwesomeIcon icon={faCheck} className="h-4 w-4 opacity-75" />
        </div>
      </div>
    </Link>
  );
}
