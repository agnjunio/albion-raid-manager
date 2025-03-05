"use client";

import GuildCard from "@/components/guilds/GuildCard";
import Loading from "@/components/Loading";
import Page from "@/components/pages/Page";
import PageTitle from "@/components/pages/PageTitle";
import useFetch from "@/hooks/useFetch";
import { Guild } from "@albion-raid-manager/database/models";

export default function GuildsPage() {
  const { response, loading, error } = useFetch("/api/guilds");
  const guilds = response as Guild[];

  if (loading) return <Loading />;
  if (error) throw new Error("Failed to load guilds. Please try again later.");
  if (!guilds) return null;

  return (
    <Page>
      <PageTitle>Your Guilds</PageTitle>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {guilds.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}
      </ul>
    </Page>
  );
}
