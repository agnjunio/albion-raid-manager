"use client";

import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@headlessui/react";
import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  const router = useRouter();

  const login: React.MouseEventHandler = (event) => {
    event.preventDefault();
    router.push("/guilds");
  };

  return (
    <div className="h-full flex items-center justify-center">
      <Button onClick={login}>
        <FontAwesomeIcon icon={faDiscord} />
        Login
      </Button>
    </div>
  );
}
