import { PageProps } from "@/app/types";
import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  redirect(`/guilds/${id}/raids`);
}
