"use client";

import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@headlessui/react";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <div className="h-full flex items-center justify-center">
      <Button onClick={() => signIn("discord")}>
        <FontAwesomeIcon icon={faDiscord} />
        Login
      </Button>
    </div>
  );
}
