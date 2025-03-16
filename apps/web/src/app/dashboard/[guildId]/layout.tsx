import Alert from "@/components/ui/alert";
import { nextAuthOptions } from "@/lib/auth";
import { prisma } from "@albion-raid-manager/database";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardLayoutProps } from "../types";

export default async function Layout({ params, children }: DashboardLayoutProps) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return redirect("/");

  const { guildId } = await params;
  const guild = await prisma.guild.findUnique({
    where: {
      id: Number(guildId),
    },
    include: { raids: true, members: true },
  });
  if (!guild) {
    return redirect("/guilds");
  }

  const isMember = guild?.members.some((member) => member.userId === session.user.id);
  if (!isMember) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2">
        <Alert>FORBIDDEN: You are not part of this guild.</Alert>
      </div>
    );
  }

  return children;
}
