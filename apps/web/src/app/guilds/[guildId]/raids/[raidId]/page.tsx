"use client";

import Card from "@/components/Card";
import Loading from "@/components/Loading";
import RaidStatusBadge from "@/components/RaidStatusBadge";
import { discord } from "@albion-raid-manager/common/helpers";
import { Prisma, Role } from "@albion-raid-manager/database/models";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
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
    setLoading(true);
    try {
      const res = await fetch(`/api/raids/${raidId}`);
      if (!res.ok) throw new Error(`Failed to fetch raid ${raidId}`);

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

  return (
    <div className="grow h-full flex flex-col p-4 gap-4">
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
                          src={discord.getUserPictureUrl(slot.user.id, slot.user.avatar)}
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
        </div>
      </Card>
    </div>
  );
}
