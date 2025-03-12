"use client";

import { Button } from "@/components/ui/button";
import { Raid, RaidStatus } from "@albion-raid-manager/database/models";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
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
      className={`select-none w-24 text-center p-1 text-xs uppercase rounded-lg font-semibold shadow-sm ${statusColors[raid.status]}`}
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
    <div className="h-full flex flex-col gap-3">
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 flex-wrap">
          {["ALL", ...Object.keys(RaidStatus)].map((status) => {
            const colors =
              filter === status
                ? "bg-primary/50 hover:bg-primary/90 active:bg-primary"
                : "bg-secondary/50 hover:bg-secondary/90 active:bg-secondary";
            return (
              <button
                key={status}
                className={`rounded-full px-4 py-1 text-sm font-semibold transition-colors cursor-pointer select-none uppercase shadow-sm ${colors}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 items-center flex-row-reverse">
          <Link href="raids/create" tabIndex={-1}>
            <Button className="whitespace-nowrap">New Raid</Button>
          </Link>

          <Link href={`/dashboard/${guildId}/raids`} replace>
            <FontAwesomeIcon icon={faRefresh} />
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {filteredRaids.map((raid) => (
          <li key={raid.id}>
            <Link
              href={`raids/${raid.id}`}
              className="flex justify-between gap-4 p-4 items-center rounded-lg bg-primary-gray-800/25 cursor-pointer hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 transition-colors outline-offset-0"
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
    </div>
  );
}
