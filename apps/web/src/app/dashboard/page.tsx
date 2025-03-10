"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDashboardContext } from "./context";

export default function Page() {
  const pathname = usePathname();
  const { selectedGuild } = useDashboardContext();
  const router = useRouter();

  useEffect(() => {
    if (selectedGuild && !pathname.includes(`/dashboard/${selectedGuild.id}`)) {
      return router.replace(`/dashboard/${selectedGuild.id}`);
    }
  }, [pathname, router, selectedGuild]);

  if (selectedGuild) return; // Wait for redirect
  return (
    <div className="flex justify-center items-center size-full flex-col gap-2">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Image src="/book.jpg" alt="Albion Raid Manager" className="rounded-full" width={80} height={80} />
          </div>
          <CardTitle className="text-2xl">Welcome to Albion Raid Manager</CardTitle>
          <CardDescription className="text-lg">Please select a guild or create one</CardDescription>
          <Link href="/guilds/create">
            <Button>
              <FontAwesomeIcon icon={faPlus} />
              <div>Create Guild</div>
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Albion Raid Manager helps you organize and manage your guild activities, track member participation, and
            schedule raids.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
