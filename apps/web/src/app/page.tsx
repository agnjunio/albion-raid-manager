"use client";

import { Container } from "@/components/pages/container";
import { Button } from "@/components/ui/button";
import { ThemeButton } from "@/components/ui/theme";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const session = useSession();

  return (
    <div className="size-full flex justify-center">
      <div className="basis-1/2 lg:basis-1/3 dark:bg-secondary/50 bg-secondary/40 z-10 bg-[url(/wallpapper.jpg)] bg-blend-multiply bg-no-repeat bg-cover bg-[center_center]">
        <div className="flex flex-col gap-2 items-center justify-center size-full">
          <h1 className="text-5xl drop-shadow-lg text-secondary-foreground font-title">Albion Raid Manager</h1>
          <p className="mt-4 text-lg max-w-md mx-auto text-secondary-foreground">
            Command every raid with precision. Plan, strategize, and lead your guild to victory.
          </p>
        </div>
      </div>

      <Container className="basis-1/2 lg:basis-1/3 flex flex-col relative items-center justify-center gap-2">
        <ThemeButton className="absolute top-2 right-2" />
        {session.data ? (
          <>
            {session.data.user.image && (
              <picture className="shadow-lg shadow-foreground/50 dark:shadow-background rounded-full">
                <img
                  src={session.data.user.image}
                  className="size-12 rounded-full select-none"
                  alt={session.data.user.name || "Unknown user"}
                />
              </picture>
            )}
            <div className="flex gap-1 items-center">
              <div>Authenticated as</div>
              <div className="font-semibold text-secondary dark:text-primary">@{session.data.user.name}</div>
            </div>

            <Link href="/dashboard" tabIndex={-1} passHref>
              <Button variant="primary">Enter</Button>
            </Link>
          </>
        ) : (
          <>
            <p>You are not logged in. Please sign in with Discord to continue.</p>

            <Button onClick={() => signIn("discord")}>
              <FontAwesomeIcon icon={faDiscord} />
              Login
            </Button>
          </>
        )}
      </Container>
    </div>
  );
}
