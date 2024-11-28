"use client";

import { Raid } from "@albion-raid-manager/database/models";
import Loading from "@components/Loading";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    <div className="grow flex flex-col gap-2 p-4">
      <h2 className="text-xl font-semibold text-center">Raids</h2>

      <div className="flex gap-2 flex-row-reverse">
        <Link href="raids/create">
          <button>Create Raid</button>
        </Link>

        <button role="icon-button" onClick={() => fetchRaids()}>
          <FontAwesomeIcon icon={faRefresh} />
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <ul className="space-y-2">
          {raids.map((raid) => (
            <li key={raid.id} className="border p-2 rounded">
              {raid.status}
              <h3 className="text-lg font-semibold">{raid.description}</h3>
              <p>{new Date(raid.date).toLocaleDateString()}</p>
            </li>
          ))}
          {raids.length === 0 && <p className="flex justify-center">No raids found.</p>}
        </ul>
      )}
    </div>
  );
}
