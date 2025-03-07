import { Container } from "@/components/pages/container";
import { DashboardSidebar } from "@/components/pages/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeButton } from "@/components/ui/theme";
import { nextAuthOptions } from "@/lib/next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: Readonly<PropsWithChildren>) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return redirect("/");

  return (
    <>
      <DashboardSidebar />
      <Container className="grow">
        <SidebarTrigger />
        <ThemeButton variant="ghost" />
        {children}
      </Container>
    </>
  );
}
