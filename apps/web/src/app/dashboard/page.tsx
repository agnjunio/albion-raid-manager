import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ServerList } from "./components/server-list";

export function DashboardPage() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-8">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <img src="/book.jpg" alt="Albion Raid Manager" className="rounded-full" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl">Welcome to Albion Raid Manager</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">Please select a guild or click Setup to start.</p>
          <p className="text-muted-foreground text-sm">
            Albion Raid Manager helps you organize and manage your guild activities, track member participation, and
            schedule raids.
          </p>
        </CardContent>
      </Card>

      <ServerList />
    </div>
  );
}
