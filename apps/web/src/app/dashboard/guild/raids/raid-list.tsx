import type { Raid, RaidStatus } from "@albion-raid-manager/core/types";

import { useMemo, useState } from "react";

import { cn } from "@albion-raid-manager/core/helpers";
import {
  faFileContract,
  faFilter,
  faHourglassStart,
  faPlay,
  faPlus,
  faRefresh,
  faStop,
  faTriangleExclamation,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { compareAsc } from "date-fns";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const statuses: {
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
const statusOrder: (keyof typeof statuses)[] = ["ALL", "SCHEDULED", "OPEN", "CLOSED", "ONGOING", "FINISHED"];

export function RaidStatusBadge({ raid }: { raid: Raid }) {
  return (
    <div
      className={cn(
        `w-24 select-none rounded-lg p-1 text-center text-xs font-semibold uppercase shadow-sm`,
        statuses[raid.status]?.color,
      )}
    >
      {raid.status}
    </div>
  );
}

interface RaidListProps {
  raids?: Raid[];
  status: string;
  onRefresh: () => void;
}

export function RaidList({ raids = [], status, onRefresh }: RaidListProps) {
  const [filter, setFilter] = useState<keyof typeof statuses>("ALL");

  const filteredRaids = useMemo(
    () =>
      raids
        .filter((raid) => filter === "ALL" || raid.status === filter)
        .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
        .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)),
    [raids, filter],
  );

  return (
    <SidebarProvider className="min-h-full">
      <Sidebar collapsible="none" variant="inset">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Status</SidebarGroupLabel>
            <SidebarMenu>
              {statusOrder.map((status) => {
                const statusData = statuses[status];
                return (
                  <SidebarMenuItem key={status}>
                    <SidebarMenuButton asChild isActive={filter === status} onClick={() => setFilter(status)}>
                      <div className={cn("flex cursor-pointer items-center capitalize")}>
                        <FontAwesomeIcon icon={statusData.icon} />
                        <span>{status}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">Raids</div>

          <div className="flex flex-row-reverse items-center gap-4">
            <Link to="raids/create" tabIndex={-1}>
              <Button className="whitespace-nowrap">
                <FontAwesomeIcon icon={faPlus} />
                <span>New Raid</span>
              </Button>
            </Link>

            <Button variant="outline" size="icon" disabled={status === "pending"} onClick={onRefresh}>
              <FontAwesomeIcon icon={faRefresh} />
            </Button>
          </div>
        </div>

        <div className="flex grow flex-col gap-2 px-2">
          {filteredRaids.map((raid) => (
            <div key={raid.id} className="border-border gap-2 rounded-lg border">
              <Link
                to={`raids/${raid.id}`}
                className="hover:bg-secondary active:bg-primary flex cursor-pointer items-center justify-between gap-4 rounded-lg p-4"
              >
                <div className="grow font-sans">{raid.description}</div>
                <div className="font-caption text-sm">
                  {new Date(raid.date).toLocaleString(navigator.language, {
                    day: "numeric",
                    month: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <RaidStatusBadge raid={raid} />
              </Link>
            </div>
          ))}
          {filteredRaids.length === 0 && <p className="flex grow items-center justify-center">No raids.</p>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
