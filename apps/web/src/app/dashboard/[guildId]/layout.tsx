import { PageError } from "@/components/ui/page";
import { auth, nextAuthOptions } from "@/lib/auth";
import { prisma } from "@albion-raid-manager/database";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardLayoutProps } from "../types";
import { DashboardProvider } from "./context";

export default async function Layout({ params, children }: DashboardLayoutProps) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return redirect("/");

  if (session.error === "RefreshTokenExpired") {
    await auth.signIn("discord");
  }

  const { guildId } = await params;
  const guild = await prisma.guild.findUnique({
    where: {
      id: guildId,
    },
    include: { raids: true, members: true },
  });

  if (!guild) {
    return redirect("/dashboard");
  }

  const isMember = guild?.members.some((member) => member.userId === session.user.id);
  if (!isMember) {
    return <PageError error={"FORBIDDEN: You are not part of this guild."} variant="error" />;
  }

  return (
    <DashboardProvider guildMember={guild.members.find((member) => member.userId === session.user.id)!}>
      {children}
    </DashboardProvider>
  );
}
