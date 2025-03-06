"use client";

import RaidStatusBadge from "@/components/raids/RaidStatusBadge";
import Card from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { getUserPictureUrl } from "@albion-raid-manager/common/helpers/discord";
import { Prisma, RaidStatus, Role } from "@albion-raid-manager/database/models";
import { faArrowLeft, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RaidParams } from "../types";

type RaidInfo = Prisma.RaidGetPayload<{
  include: { slots: { include: { build: true; user: true } } };
}>;

export default function RaidPage() {
  const params = useParams<RaidParams>();
  const [loading, setLoading] = useState(false);
  const [raid, setRaid] = useState<RaidInfo>();

  const { raidId } = params;

  const fetchRaid = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/raids/${raidId}`);
      if (!res.ok) throw new Error(`Failed to fetch raid ${raidId}`);
      const data = await res.json();
      setRaid(data);
    } finally {
      setLoading(false);
    }
  };

  const updateRaidStatus = async (status: RaidStatus) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/raids/${raidId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
        }),
      });
      if (!res.ok) throw new Error(`Failed to set raid status ${raidId}`);
      const data = await res.json();
      setRaid(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaid();
  }, []);

  if (loading) return <Loading />;
  if (!raid) return <div>Raid not found</div>;

  const roleBg: { [key in Role]: string } = {
    TANK: "bg-role-tank/25",
    CALLER: "bg-role-caller/25",
    SUPPORT: "bg-role-support/25",
    HEALER: "bg-role-healer/25",
    RANGED_DPS: "bg-role-ranged/25",
    MELEE_DPS: "bg-role-melee/25",
    BATTLEMOUNT: "bg-role-battlemount/25",
  };

  const hasStatus = (...statuses: RaidStatus[]) => {
    return statuses.includes(raid.status);
  };

  return (
    <div className="grow h-full flex flex-col p-4 gap-4">
      <div>
        <button role="icon-button" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      <Card title="Raid Details">
        <div className="grid grid-cols-auto_1fr gap-x-4 gap-y-2">
          <div>Description:</div>
          <div className="font-semibold">{raid.description}</div>
          <div>Status:</div>
          <div className="block">
            <RaidStatusBadge raid={raid} />
          </div>
          <div>Start date:</div>
          <div>
            {new Date(raid.date).toLocaleString(navigator.language, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </div>
      </Card>

      <Card title="Raid Actions">
        <div className="flex gap-2">
          {hasStatus(RaidStatus.SCHEDULED, RaidStatus.CLOSED) && (
            <button className="btn-primary-yellow" onClick={() => updateRaidStatus(RaidStatus.OPEN)}>
              Open Registration
            </button>
          )}
          {hasStatus(RaidStatus.OPEN) && (
            <button className="btn-primary-yellow" onClick={() => updateRaidStatus(RaidStatus.CLOSED)}>
              Close Registration
            </button>
          )}
          {hasStatus(RaidStatus.OPEN, RaidStatus.CLOSED, RaidStatus.FINISHED) && (
            <button className="btn-primary-yellow" onClick={() => updateRaidStatus(RaidStatus.ONGOING)}>
              Start Raid
            </button>
          )}
          {hasStatus(RaidStatus.ONGOING) && (
            <button className="btn-primary-yellow" onClick={() => updateRaidStatus(RaidStatus.FINISHED)}>
              Finish Raid
            </button>
          )}
        </div>
      </Card>

      <Card
        title="Raid Slots"
        actions={
          <button role="icon-button" onClick={() => fetchRaid()}>
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          {raid.slots
            .sort((a, b) => a.id - b.id)
            .map((slot) => (
              <div
                key={slot.id}
                className={`min-h-12 rounded px-4 py-2 flex justify-between items-center ${roleBg[slot.build.role] || "bg-secondary-violet/25"}`}
              >
                <div className="font-semibold">{slot.build.name}</div>
                <div>
                  {slot.user ? (
                    <div className="flex items-center gap-2">
                      <div>{slot.user.username}</div>
                      <picture>
                        <img
                          src={getUserPictureUrl(slot.user.id, slot.user.avatar)}
                          className="size-8 rounded-full select-none"
                          alt={slot.user.username}
                        />
                      </picture>
                    </div>
                  ) : (
                    <div className="text-xs">Empty</div>
                  )}
                </div>
              </div>
            ))}
          {raid.slots.length === 0 && <div className="text-center">No slots available.</div>}
        </div>
      </Card>
    </div>
  );
}
