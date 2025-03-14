"use client";

import { Container } from "@/components/ui/container";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
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
            <SidebarGroupAction asChild>
              <Link href={`/dashboard/${guildId}/raids/create`}>
                <FontAwesomeIcon icon={faPlus} />
              </Link>
            </SidebarGroupAction>
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

      <SidebarInset className="p-4">
        <Container className="flex flex-1 flex-col space-y-2 overflow-hidden rounded-lg">
          <ul>
            {filteredRaids.map((raid) => (
              <li key={raid.id}>
                <Link
                  href={`raids/${raid.id}`}
                  className="hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 flex cursor-pointer items-center justify-between gap-4 rounded-lg p-4 outline-offset-0 transition-colors"
                >
                  <div className="grow text-lg font-semibold">{raid.description}</div>
                  <div>
                    {new Date(raid.date).toLocaleString(navigator.language, {
                      day: "numeric",
                      month: "2-digit",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                  <RaidStatusBadge raid={raid} />
                </Link>
              </li>
            ))}
            {filteredRaids.length === 0 && <p className="flex items-center justify-center">No raids.</p>}
          </ul>
        </Container>
      </SidebarInset>
    </SidebarProvider>
  );
}

//   const colors =
//     filter === status
//       ? "bg-primary/50 hover:bg-primary/90 active:bg-primary"
//       : "bg-secondary/50 hover:bg-secondary/90 active:bg-secondary";
//   return (
//     <button
//       key={status}
//       className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors cursor-pointer select-none uppercase shadow-sm ${colors}`}
//       onClick={() => setFilter(status)}
//     >
//       {status}
//     </button>
//   );

// <div className="flex justify-between items-center gap-2">
//   <div className="flex gap-2 flex-wrap"></div>

//   <div className="flex gap-2 items-center flex-row-reverse">
//     <Link href="raids/create" tabIndex={-1}>
//       <Button className="whitespace-nowrap">New Raid</Button>
//     </Link>

//     <Link href={`/dashboard/${guildId}/raids`} replace>
//       <FontAwesomeIcon icon={faRefresh} />
//     </Link>
//   </div>
// </div>
