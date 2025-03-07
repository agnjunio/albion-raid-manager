"use client";

import { Button } from "@/components/ui/button";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const session = useSession();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2">
      {session.data ? (
        <>
          <div className="flex gap-2 items-center">
            <div>Logged in as:</div>

            <div className="flex items-center gap-2">
              <div>{session.data.user.name}</div>
              {session.data.user.image && (
                <picture>
                  <img src={session.data.user.image} className="size-8 rounded-full select-none" />
                </picture>
              )}
            </div>
          </div>

          <Link href="/guilds" tabIndex={-1}>
            <Button>Guilds</Button>
          </Link>
        </>
      ) : (
        <>
          <div>Not logged in</div>

          <Button onClick={() => signIn("discord")}>
            <FontAwesomeIcon icon={faDiscord} />
            Login
          </Button>
        </>
      )}
    </div>
  );
}
