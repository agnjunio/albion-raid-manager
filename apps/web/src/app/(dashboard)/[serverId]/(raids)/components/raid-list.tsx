import type { Raid } from "@albion-raid-manager/types";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { RaidStatusBadge } from "@/components/raids/raid-badge";
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
import { raidStatuses } from "@/lib/constants";

const statusOrder: (keyof typeof raidStatuses)[] = ["ALL", "SCHEDULED", "OPEN", "CLOSED", "ONGOING", "FINISHED"];

interface RaidListProps {
  raids?: Raid[];
  status: string;
  onRefresh: () => void;
}

export function RaidList({ raids = [], status, onRefresh }: RaidListProps) {
  const [filter, setFilter] = useState<keyof typeof raidStatuses>("ALL");

  const filteredRaids = useMemo(
    () =>
      raids
        .filter((raid) => filter === "ALL" || raid.status === filter)
        .sort((a, b) => {
          const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          if (statusDiff !== 0) return statusDiff;
          // Sort by date ascending if status is the same
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }),
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
                const statusData = raidStatuses[status];
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
            <Link to="create" tabIndex={-1}>
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
                to={raid.id}
                className="hover:bg-secondary/20 active:bg-primary flex cursor-pointer items-center justify-between gap-4 rounded-lg p-4"
              >
                <div className="grow font-sans">{raid.title}</div>
                <div className="font-caption text-sm">
                  {new Date(raid.date).toLocaleString(navigator.language, {
                    day: "numeric",
                    month: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                <RaidStatusBadge status={raid.status} />
              </Link>
            </div>
          ))}
          {filteredRaids.length === 0 && <p className="flex grow items-center justify-center">No raids.</p>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
