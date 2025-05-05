import { Container } from "@/components/ui/container";
import { SidebarProvider } from "@/components/ui/sidebar";
import { nextAuthOptions } from "@/lib/auth";
import { prisma } from "@albion-raid-manager/database";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardProvider } from "./context";
import { DashboardSidebar } from "./sidebar";
import { DashboardTitle } from "./title";
import { DashboardLayoutProps } from "./types";

export default async function Layout({ children }: Readonly<DashboardLayoutProps>) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) return redirect("/");

  const guilds = await prisma.guild.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        where: {
          userId: session.user.id,
        },
      },
    },
  });

  return (
    <DashboardProvider guilds={guilds}>
      <SidebarProvider>
        <DashboardSidebar />
        <Container className="flex grow flex-col">
          <DashboardTitle />
          <div className="grow">{children}</div>
        </Container>
      </SidebarProvider>
    </DashboardProvider>
  );
}
