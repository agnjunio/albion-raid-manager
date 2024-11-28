"use client";

import { Raid } from "@albion-raid-manager/database/models";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
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
            guildId: params.id as string,
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
    <div className="grow h-full flex flex-col gap-2 p-4">
      <h2 className="text-xl font-semibold text-center">Raids</h2>

      <div className="flex gap-2 flex-row-reverse">
        <Link href="raids/create" tabIndex={-1}>
          <button>Create Raid</button>
        </Link>

        <button role="icon-button" onClick={() => fetchRaids()}>
          <FontAwesomeIcon icon={faRefresh} />
        </button>
      </div>

      <RaidList raids={raids} loading={loading} />
    </div>
  );
}
