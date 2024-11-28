import Loading from "@/components/Loading";
import { Raid, RaidStatus } from "@albion-raid-manager/database/models";
import { compareAsc } from "date-fns";
import { useState } from "react";

const statusColors = {
  [RaidStatus.SCHEDULED]: "bg-secondary-violet-800",
  [RaidStatus.OPEN]: "bg-green-900",
  [RaidStatus.CLOSED]: "bg-red-900",
  [RaidStatus.ONGOING]: "bg-primary-yellow-900",
  [RaidStatus.FINISHED]: "bg-primary-gray-500",
};

const statusOrder = [RaidStatus.SCHEDULED, RaidStatus.OPEN, RaidStatus.CLOSED, RaidStatus.ONGOING, RaidStatus.FINISHED];

export default function RaidList({ raids, loading }: { raids: Raid[]; loading: boolean }) {
  const [filter, setFilter] = useState("ALL");

  const filteredRaids = raids
    .filter((raid) => filter === "ALL" || raid.status === filter)
    .sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)))
    .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  if (loading) return <Loading />;
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex gap-2">
        {["ALL", ...Object.keys(RaidStatus)].map((status) => {
          const colors =
            filter === status
              ? "bg-primary-yellow/50 hover:bg-primary-yellow-700/90 active:bg-primary-yellow-600"
              : "bg-secondary-violet-700 hover:bg-secondary-violet/50 active:bg-secondary-violet-600";
          return (
            <button
              key={status}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors cursor-pointer select-none uppercase ${colors}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          );
        })}
      </div>

      <ul className="space-y-2 rounded-lg bg-primary-gray-800/25">
        {filteredRaids.map((raid) => (
          <li
            key={raid.id}
            className="p-2 rounded-lg bg-primary-gray-800/25 cursor-pointer hover:bg-primary-gray-500/25 transition-colors"
          >
            <div className="flex justify-between gap-4 p-2 items-center">
              <div className="grow text-lg font-semibold">{raid.description}</div>
              <div>
                {new Date(raid.date).toLocaleString(navigator.language, {
                  day: "numeric",
                  month: "2-digit",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <div
                className={`basis-24 text-center p-1 text-xs uppercase rounded-lg font-semibold ${statusColors[raid.status]}`}
              >
                {raid.status}
              </div>
            </div>
          </li>
        ))}
        {filteredRaids.length === 0 && <p className="flex h-24 items-center justify-center">No raids.</p>}
      </ul>
    </div>
  );
}
