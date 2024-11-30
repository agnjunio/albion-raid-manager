"use client";

import Card from "@/components/Card";
import Loading from "@/components/Loading";
import { Prisma, Role } from "@albion-raid-manager/database/models";
import { faPlus, faRefresh } from "@fortawesome/free-solid-svg-icons";
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
      const res = await fetch(`/api/composition/${compositionId}`);
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
  if (!composition) return <div>Composition not found</div>;

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
      <Card title="Composition Details">
        <div className="grid grid-cols-auto_1fr gap-x-4 gap-y-2">
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
          <>
            <button role="icon-button">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button role="icon-button" onClick={() => fetchComposition()}>
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          {composition.slots
            .sort((a, b) => a.id - b.id)
            .map((slot) => (
              <div
                key={slot.id}
                className={`min-h-12 rounded px-4 py-2 flex justify-between items-center ${roleBg[slot.build.role] || "bg-secondary-violet/25"}`}
              >
                <div className="font-semibold">{slot.build.name}</div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
