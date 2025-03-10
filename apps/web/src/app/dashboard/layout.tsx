import { Container } from "@/components/pages/container";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeButton } from "@/components/ui/theme";
import { nextAuthOptions } from "@/lib/next-auth";
import { prisma } from "@albion-raid-manager/database";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardProvider } from "./context";
import { DashboardSidebar } from "./sidebar";
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
      members: true,
    },
  });

  return (
    <DashboardProvider guilds={guilds}>
      <SidebarProvider>
        <DashboardSidebar />
        <Container className="grow flex flex-col">
          <div className="flex justify-between p-2 sticky top-0">
            <SidebarTrigger />
            <ThemeButton variant="ghost" />
          </div>
          <div className="grow">{children}</div>
        </Container>
      </SidebarProvider>
    </DashboardProvider>
  );
}
