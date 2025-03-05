"use client";

import Loading from "@/components/Loading";
import Page from "@/components/pages/Page";
import PageTitle from "@/components/pages/PageTitle";
import RaidList from "@/components/raids/RaidList";
import useFetch from "@/hooks/useFetch";
import { Raid } from "@albion-raid-manager/database/models";
import { useParams } from "next/navigation";

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
    <Page>
      <PageTitle>Raids</PageTitle>

      <RaidList raids={raids} loading={loading} onRefresh={() => refresh()} />
    </Page>
  );
}
