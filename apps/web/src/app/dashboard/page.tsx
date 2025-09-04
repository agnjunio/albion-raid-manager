import { useEffect } from "react";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useDashboard } from "./contexts/dashboard-context";

export function DashboardPage() {
  const location = useLocation();
  const { selectedGuild } = useDashboard();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedGuild && !location.pathname.includes(`/dashboard/${selectedGuild.id}`)) {
      navigate(`/dashboard/${selectedGuild.id}`);
    }
  }, [location.pathname, navigate, selectedGuild]);

  if (selectedGuild) return; // Wait for redirect
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="bg-primary/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
            <img src="/book.jpg" alt="Albion Raid Manager" className="rounded-full" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl">Welcome to Albion Raid Manager</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm">Please select a guild or click Create Guild to start.</p>
          <Link to="/dashboard/create">
            <Button>
              <FontAwesomeIcon icon={faPlus} />
              <div>Create Guild</div>
            </Button>
          </Link>
          <p className="text-muted-foreground text-sm">
            Albion Raid Manager helps you organize and manage your guild activities, track member participation, and
            schedule raids.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
