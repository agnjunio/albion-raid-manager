"use client";

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
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { Raid, RaidStatus } from "@albion-raid-manager/database/models";
import {
  faFileContract,
  faFilter,
  faHourglassStart,
  faPlay,
  faPlus,
  faRefresh,
  faStop,
  faTriangleExclamation,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { compareAsc } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useRaidsContext } from "./context";

const statuses: {
  [status: string]: {
    icon: IconDefinition;
    color?: string;
  };
} = {
  ALL: {
    icon: faFilter,
  },
  [RaidStatus.SCHEDULED]: {
    icon: faHourglassStart,
    color: "bg-secondary",
  },
  [RaidStatus.OPEN]: {
    icon: faFileContract,
    color: "bg-green-800",
  },
  [RaidStatus.CLOSED]: {
    icon: faTriangleExclamation,
    color: "bg-red-900",
  },
  [RaidStatus.ONGOING]: {
    icon: faPlay,
    color: "bg-primary",
  },
  [RaidStatus.FINISHED]: {
    icon: faStop,
    color: "bg-gray-500",
  },
};
const statusOrder: (keyof typeof statuses)[] = [
  "ALL",
  RaidStatus.SCHEDULED,
  RaidStatus.OPEN,
  RaidStatus.CLOSED,
  RaidStatus.ONGOING,
  RaidStatus.FINISHED,
];

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

export function RaidList() {
  const { guildId } = useParams();
  const { raids } = useRaidsContext();
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
            <Link href="raids/create" tabIndex={-1}>
              <Button className="whitespace-nowrap">
                <FontAwesomeIcon icon={faPlus} />
                <span>New Raid</span>
              </Button>
            </Link>

            <Link href={`/dashboard/${guildId}/raids`} replace tabIndex={-1}>
              <Button variant="outline" size="icon">
                <FontAwesomeIcon icon={faRefresh} />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex grow flex-col gap-2 px-2">
          {filteredRaids.map((raid) => (
            <div key={raid.id} className="border-border gap-2 rounded-lg border">
              <Link
                href={`raids/${raid.id}`}
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
