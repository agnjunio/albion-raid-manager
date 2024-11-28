"use client";

import { Raid } from "@albion-raid-manager/database/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RaidList from "./RaidList";

export default function GuildPage() {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [raids, setRaids] = useState<Raid[]>([]);

  const fetchRaids = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/raids?` +
          new URLSearchParams({
            guildId: params.guildId as string,
          }).toString(),
      );

      if (!res.ok) throw new Error("Failed to fetch raids");
      const data = await res.json();
      setRaids(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaids();
  }, []);

  return (
    <div className="grow h-full flex flex-col px-4">
      <h2 className="text-2xl font-semibold text-center py-4">Raids</h2>

      <RaidList raids={raids} loading={loading} onRefresh={() => fetchRaids()} />
    </div>
  );
}
