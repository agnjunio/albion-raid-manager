import { GuildPageProps } from "@/app/guilds/[guildId]/types";
import { redirect } from "next/navigation";

export default async function Page({ params }: GuildPageProps) {
  const { guildId } = await params;
  redirect(`/guilds/${guildId}/raids`);
}
