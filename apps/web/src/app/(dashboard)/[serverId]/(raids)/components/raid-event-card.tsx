import type { Raid } from "@albion-raid-manager/types";

import { useDraggable } from "@dnd-kit/core";
import { faMapMarkerAlt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { RaidStatusBadge } from "@/components/raids/raid-badge";
import { raidStatuses } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RaidEventCardProps {
  raid: Raid;
  variant?: "default" | "compact" | "time-slot";
  className?: string;
}

export function RaidEventCard({ raid, variant = "default", className }: RaidEventCardProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: raid.id,
    data: {
      raid,
    },
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={cn(
          "hover:bg-accent/50 block cursor-pointer rounded border-l-4 transition-colors active:ring-0",
          raidStatuses[raid.status]?.color,
          getVariantStyles(),
          isDragging && "opacity-0",
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
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={cn(
          "bg-muted/50 hover:bg-accent/50 block cursor-pointer rounded border-l-4 shadow-sm transition-colors active:ring-0",
          raidStatuses[raid.status]?.color,
          getVariantStyles(),
          isDragging && "opacity-0",
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <div className="truncate text-xs font-medium">{raid.title}</div>
        </div>
        <div className="text-xs opacity-75">{formatTime(raid.date)}</div>
        {raid.location && (
          <div className="flex items-center gap-1 text-xs opacity-75">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-2 w-2" />
            <span className="truncate">{raid.location}</span>
          </div>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={raid.id}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "block cursor-pointer rounded-lg border transition-all hover:shadow-md active:ring-0",
        raidStatuses[raid.status]?.color,
        getVariantStyles(),
        isDragging && "opacity-0",
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
      </div>
    </Link>
  );
}
