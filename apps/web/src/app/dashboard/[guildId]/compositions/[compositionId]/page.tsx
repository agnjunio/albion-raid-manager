"use client";

import Card from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import { Prisma, Role } from "@albion-raid-manager/database/models";
import { faArrowLeft, faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CompositionParams } from "../types";

type CompositionInfo = Prisma.CompositionGetPayload<{
  include: {
    slots: {
      include: {
        build: true;
      };
    };
  };
}>;

export default function RaidPage() {
  const params = useParams<CompositionParams>();
  const [loading, setLoading] = useState(false);
  const [composition, setComposition] = useState<CompositionInfo>();

  const { compositionId } = params;

  const fetchComposition = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/compositions/${compositionId}`);
      if (!res.ok) throw new Error(`Failed to fetch composition ${compositionId}`);
      const data = await res.json();
      setComposition(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComposition();
  }, []);

  if (loading) return <Loading />;
  if (!composition) return <div className="flex h-full items-center justify-center">Composition not found.</div>;

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
    <div className="flex h-full grow flex-col gap-4 p-4">
      <div>
        <button role="icon-button" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      <Card title="Composition Details">
        <div className="grid-cols-auto_1fr grid gap-x-4 gap-y-2">
          <div>Name:</div>
          <div className="font-semibold">{composition.name}</div>
          <div>Last update:</div>
          <div>
            {new Date(composition.updatedAt).toLocaleString(navigator.language, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        </div>
      </Card>

      <Card
        title="Composition Slots"
        actions={
          <div className="flex flex-row-reverse gap-2">
            <button role="icon-button">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button role="icon-button" onClick={() => fetchComposition()}>
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          {composition.slots
            .sort((a, b) => a.id - b.id)
            .map((slot) => (
              <div
                key={slot.id}
                className={`flex min-h-12 items-center justify-between rounded px-4 py-2 ${roleBg[slot.build.role] || "bg-secondary-violet/25"}`}
              >
                <div className="font-semibold">{slot.build.name}</div>
              </div>
            ))}
          {composition.slots.length === 0 && <div className="text-center">No slots available.</div>}
        </div>
      </Card>
    </div>
  );
}
