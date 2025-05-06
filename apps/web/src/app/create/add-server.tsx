"use client";

import { createGuild, CreateGuildSuccessResponse } from "@/actions/guilds";
import { verifyServer } from "@/actions/servers";
import Alert from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { translateErrorCode } from "@/lib/errors";
import { Server } from "@albion-raid-manager/discord";
import { getServerInviteUrl, getServerPictureUrl } from "@albion-raid-manager/discord/helpers";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "./loading";

enum CreateStep {
  SERVER_SELECT,
  SERVER_INVITATION,
  SERVER_VERIFICATION,
  COMPLETE,
}

interface AddServerProps {
  servers: Server[];
  userId: string;
}

export function AddServer({ servers, userId }: AddServerProps) {
  const [step, setStep] = useState(CreateStep.SERVER_SELECT);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<WindowProxy | null>(null);
  const [createGuildSuccessResponse, setCreateGuildSuccessResponse] = useState<CreateGuildSuccessResponse>();
  const [server, setServer] = useState<Server>();

  const handleServerSelect = useCallback(
    async (server: Server) => {
      setServer(server);
      setError(null);

      if (!popup || popup.closed) {
        setPopup(
          window.open(getServerInviteUrl(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!, server.id), "_blank", "popup"),
        );
      } else {
        popup.focus();
      }

      setStep(CreateStep.SERVER_INVITATION);
    },
    [popup],
  );

  const handlePopupClosed = useCallback(async () => {
    setPopup(null);
    setStep(CreateStep.SERVER_VERIFICATION);

    if (!server) {
      setError("SERVER_VERIFICATION_FAILED");
      setStep(CreateStep.SERVER_SELECT);
      return;
    }

    const verifyServerResponse = await verifyServer(server);
    if (!verifyServerResponse.success) {
      setError("SERVER_VERIFICATION_FAILED");
      setStep(CreateStep.SERVER_SELECT);
      return;
    }

    const createGuildResponse = await createGuild(server, userId);
    if (!createGuildResponse.success) {
      setError(createGuildResponse.error);
      setStep(CreateStep.SERVER_SELECT);
      return;
    }

    setError(null);
    setCreateGuildSuccessResponse(createGuildResponse.data);
    setStep(CreateStep.COMPLETE);
  }, [server, userId]);

  return (
    <Card className="max-h-[80vh] w-full min-w-[30vw] max-w-lg">
      <CardHeader className="space-y-3">
        {error && <Alert className="p-3">{translateErrorCode(error)}</Alert>}
        <CardTitle>Add server</CardTitle>
      </CardHeader>

      {step === CreateStep.SERVER_SELECT && <ServerSelect servers={servers} onServerSelect={handleServerSelect} />}
      {step === CreateStep.SERVER_INVITATION && <ServerInvitation popup={popup} onPopupClosed={handlePopupClosed} />}
      {step === CreateStep.SERVER_VERIFICATION && <ServerVerification server={server} />}
      {step === CreateStep.COMPLETE && <Complete createGuildSuccessResponse={createGuildSuccessResponse} />}
    </Card>
  );
}

interface ServerSelectProps {
  servers: Server[];
  onServerSelect: (server: Server) => void;
}

function ServerSelect({ servers, onServerSelect }: ServerSelectProps) {
  return (
    <CardContent className="flex flex-col gap-2 overflow-auto">
      <p className="text-muted-foreground text-sm">Please select a discord server to add to your account.</p>
      <div className="flex flex-col gap-2">
        {servers.map((server) => (
          <div
            key={server.id}
            className="border-input hover:bg-accent/50 flex cursor-pointer select-none items-center rounded-lg border p-4 shadow-md transition-all duration-200 hover:shadow-lg"
            onClick={() => onServerSelect(server)}
          >
            <Image
              src={server.icon ? getServerPictureUrl(server.id, server.icon) : "/default-server-icon.png"}
              alt={`${server.name} icon`}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="ml-4 flex-grow">
              <h3 className="truncate whitespace-nowrap text-lg font-semibold">{server.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
}

interface ServerInviationProps {
  popup: WindowProxy | null;
  onPopupClosed: () => void;
}

function ServerInvitation({ popup, onPopupClosed }: ServerInviationProps) {
  useEffect(() => {
    const invitePopupTick = setInterval(function () {
      if (popup?.closed) {
        clearInterval(invitePopupTick);
        onPopupClosed();
      }
    }, 1000);
  }, [onPopupClosed, popup?.closed]);

  return (
    <CardContent>
      <Loading label="Waiting to finish invitation step in discord. Don't forget to close the popup." />
    </CardContent>
  );
}

interface ServerVerificationProps {
  server?: Server;
}

function ServerVerification({ server }: ServerVerificationProps) {
  return (
    <CardContent>
      <Loading label={`Verifiying server ${server?.name}...`} />
    </CardContent>
  );
}

interface CompleteProps {
  createGuildSuccessResponse?: CreateGuildSuccessResponse;
}

function Complete({ createGuildSuccessResponse }: CompleteProps) {
  const router = useRouter();

  useEffect(() => {
    if (createGuildSuccessResponse) {
      router.push(`/dashboard/${createGuildSuccessResponse.guild.id}`);
    }
  }, [createGuildSuccessResponse, router]);

  const link = `/dashboard/${createGuildSuccessResponse?.guild.id}`;
  return (
    <CardContent className="flex flex-col items-center gap-3">
      <FontAwesomeIcon icon={faCheck} size="2xl" />
      <p className="text-muted-foreground text-base">
        Verification complete. You will be redirected to the dashboard page. Please <Link href={link}>click here</Link>{" "}
        if that doesn't happen.
      </p>
    </CardContent>
  );
}
