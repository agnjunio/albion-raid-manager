"use client";

import Loading from "@/components/Loading";
import useFetch from "@/hooks/useFetch";
import { Raid } from "@albion-raid-manager/database/models";
import { useParams } from "next/navigation";
import RaidList from "./RaidList";

export default function GuildPage() {
  const params = useParams();
  const { response, loading, error, refresh } = useFetch(
    "/api/raids?" +
      new URLSearchParams({
        guildId: params.guildId as string,
      }).toString(),
  );
  const raids = response as Raid[];

  if (loading) return <Loading />;
  if (error) throw new Error("Failed to load guilds. Please try again later.");
  if (!raids) return null;

  return (
    <div className="grow h-full flex flex-col px-4">
      <h2 className="text-2xl font-semibold text-center py-4">Raids</h2>

      <RaidList raids={raids} loading={loading} onRefresh={() => refresh()} />
    </div>
  );
}
