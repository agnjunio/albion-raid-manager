import { redirect } from "next/navigation";
import { DashboardPageProps } from "../types";

export default async function Page({ params }: DashboardPageProps) {
  const { guildId } = await params;
  redirect(`/dashboard/${guildId}/raids`);
}
