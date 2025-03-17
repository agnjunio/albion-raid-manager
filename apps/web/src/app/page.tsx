"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeButton } from "@/components/ui/theme";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const session = useSession();

  return (
    <div className="flex size-full justify-center">
      <div className="dark:bg-secondary/50 bg-secondary/40 relative z-10 basis-1/2 overflow-hidden bg-[url(/wallpapper.jpg)] bg-cover bg-[center_center] bg-no-repeat bg-blend-multiply lg:basis-1/3">
        <div className="bg-radial -translate-1/2 from-primary/15 to-bg-primary/0 absolute -left-20 top-0 size-[150vh] animate-pulse rounded-full to-85% blur-2xl [animation-duration:1780ms] [animation-timing-function:ease-in-out]" />
        <div className="bg-radial -translate-1/2 from-primary/15 to-bg-primary/0 absolute left-40 top-0 size-[80vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:2500ms]" />
        <div className="bg-radial from-primary/15 to-bg-primary/0 absolute right-0 top-0 size-[40vh] -translate-y-2/3 animate-pulse rounded-full to-100% blur-2xl [animation-duration:1500ms]" />
        <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 absolute left-[15%] top-0 size-[50vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1250ms]" />
        <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 absolute left-[35%] top-0 size-[60vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1100ms]" />
        <div className="bg-radial -translate-1/2 from-primary/10 to-bg-primary/0 absolute left-[65%] top-0 size-[55vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:1370ms]" />

        <div className="bg-radial translate-1/2 from-secondary/50 to-secondary/15 absolute bottom-0 right-0 size-[80vh] animate-pulse rounded-full to-100% blur-2xl [animation-duration:5000ms]" />

        <div className="flex size-full flex-col items-center justify-center gap-2">
          <h1 className="text-secondary-foreground font-title text-5xl drop-shadow-lg">Albion Raid Manager</h1>
          <p className="text-secondary-foreground mx-auto mt-4 max-w-md text-lg">
            Command every raid with precision. Plan, strategize, and lead your guild to victory.
          </p>
        </div>
      </div>

      <Container className="relative flex basis-1/2 flex-col items-center justify-center gap-2 lg:basis-1/3">
        <ThemeButton className="absolute right-2 top-2" />
        {
          {
            loading: (
              <>
                <Skeleton className="size-12 rounded-full" />
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-10 w-24" />
              </>
            ),
            authenticated: (
              <>
                {session.data?.user.image && (
                  <picture className="shadow-foreground/50 dark:shadow-background rounded-full shadow-lg">
                    <img
                      src={session.data.user.image}
                      className="size-12 select-none rounded-full"
                      alt={session.data.user.name || "Unknown user"}
                    />
                  </picture>
                )}
                <div className="flex items-center gap-1">
                  <div>Authenticated as</div>
                  <div className="text-secondary dark:text-primary font-semibold">
                    @{session.data?.user.name || "Usuário desconhecido"}
                  </div>
                </div>

                <Link href="/dashboard" tabIndex={-1} passHref>
                  <Button variant="primary">Enter</Button>
                </Link>
              </>
            ),
            unauthenticated: (
              <>
                <p>You are not logged in. Please sign in with Discord to continue.</p>

                <Button onClick={() => signIn("discord")}>
                  <FontAwesomeIcon icon={faDiscord} />
                  Login
                </Button>
              </>
            ),
          }[session.status]
        }
      </Container>
    </div>
  );
}
