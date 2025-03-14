"use client";

import { Card } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Raid, RaidStatus } from "@albion-raid-manager/database/models";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { compareAsc } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useRaidsContext } from "./context";

const statusOrder = [RaidStatus.SCHEDULED, RaidStatus.OPEN, RaidStatus.CLOSED, RaidStatus.ONGOING, RaidStatus.FINISHED];

export function RaidStatusBadge({ raid }: { raid: Raid }) {
  const statusColors = {
    [RaidStatus.SCHEDULED]: "bg-secondary-violet-800",
    [RaidStatus.OPEN]: "bg-green-800",
    [RaidStatus.CLOSED]: "bg-red-900",
    [RaidStatus.ONGOING]: "bg-primary-yellow-800",
    [RaidStatus.FINISHED]: "bg-primary-gray-500",
  };

  return (
    <div
      className={`w-24 select-none rounded-lg p-1 text-center text-xs font-semibold uppercase shadow-sm ${statusColors[raid.status]}`}
    >
      {raid.status}
    </div>
  );
}

export function RaidList() {
  const { guildId } = useParams();
  const { raids } = useRaidsContext();
  const [filter, setFilter] = useState("ALL");

  const filteredRaids = useMemo(
    () =>
      raids
        .filter((raid) => filter === "ALL" || raid.status === filter)
        .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
        .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)),
    [raids, filter],
  );

  return (
    <Card>
      <SidebarProvider>
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {["All", ...Object.keys(RaidStatus)].map((status) => (
                  <SidebarMenuItem key={status}>
                    <SidebarMenuButton asChild isActive={filter === status}>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faFilter} />
                        <span>{status}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
          <ul className="space-y-2">
            {filteredRaids.map((raid) => (
              <li key={raid.id}>
                <Link
                  href={`raids/${raid.id}`}
                  className="bg-primary-gray-800/25 hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 flex cursor-pointer items-center justify-between gap-4 rounded-lg p-4 outline-offset-0 transition-colors"
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
        </main>
      </SidebarProvider>
    </Card>
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
