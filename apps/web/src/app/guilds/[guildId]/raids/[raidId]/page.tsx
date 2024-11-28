"use client";

import Card from "@/components/Card";
import Loading from "@/components/Loading";
import RaidStatusBadge from "@/components/RaidStatusBadge";
import { Prisma } from "@albion-raid-manager/database/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RaidParams } from "../types";

type RaidInfo = Prisma.RaidGetPayload<{
  include: { slots: { include: { build: true } } };
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
      if (!res.ok) throw new Error("Failed to fetch raids");

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
          <div>{new Date(raid.date).toString()}</div>
        </div>
      </Card>

      <Card title="Raid Slots">
        <div className="grid grid-cols-auto_1fr gap-x-4 gap-y-2">
          {raid.slots.map((slot) => (
            <div key={slot.id}>
              <div className="font-semibold">{slot.build.name}</div>
              <div>{slot.build.role}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
