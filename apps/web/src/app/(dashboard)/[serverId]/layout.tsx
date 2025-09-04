import { Outlet } from "react-router-dom";

import { Container } from "@/components/ui/container";

import { ServerSidebar } from "./components/server-sidebar";

export function ServerLayout() {
  return (
    <div className="flex h-full">
      <ServerSidebar />
      <Container className="flex-1">
        <Outlet />
      </Container>
    </div>
  );
}
