import { useCallback, useState } from "react";

import { APIErrorType } from "@albion-raid-manager/core/types/api/index";
import { DiscordServer, SetupServer } from "@albion-raid-manager/core/types/api/servers";

import Alert from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { isAPIError } from "@/lib/api";
import { useAddServerMutation } from "@/store/servers";

import { Complete, DiscordInvite, ServerInfo, ServerVerification } from "./steps";

enum CreateStep {
  SERVER_INFO,
  DISCORD_INVITE,
  VERIFICATION,
  COMPLETE,
}

interface ServerSetupProps {
  server: DiscordServer;
}

export function ServerSetup({ server }: ServerSetupProps) {
  const [step, setStep] = useState(CreateStep.SERVER_INFO);
  const [error, setError] = useState<string | null>(null);
  const [createGuildSuccessResponse, setCreateGuildSuccessResponse] = useState<SetupServer.Response>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [addServer] = useAddServerMutation();

  const handleStartVerification = useCallback(async () => {
    setStep(CreateStep.VERIFICATION);
    setIsVerifying(true);
    setError(null);

    const body: SetupServer.Body = {
      serverId: server.id,
    };

    const addServerResponse = await addServer({ body });
    if (addServerResponse.error) {
      setError(
        isAPIError(addServerResponse.error) ? addServerResponse.error.data : APIErrorType.SERVER_VERIFICATION_FAILED,
      );
      setStep(CreateStep.DISCORD_INVITE);
      setIsVerifying(false);
      return;
    }

    setError(null);
    setCreateGuildSuccessResponse(addServerResponse.data);
    setStep(CreateStep.COMPLETE);
    setIsVerifying(false);
  }, [server.id, addServer]);

  const handleNextStep = useCallback(() => {
    if (step === CreateStep.SERVER_INFO) {
      setStep(CreateStep.DISCORD_INVITE);
    }
  }, [step]);

  return (
    <Card className="max-h-[80vh] w-full min-w-[30vw] max-w-lg">
      <CardHeader className="space-y-3">
        {error && <Alert className="p-3">{error}</Alert>}
        <CardTitle>Server setup</CardTitle>
      </CardHeader>

      {step === CreateStep.SERVER_INFO && <ServerInfo server={server} onNext={handleNextStep} />}
      {step === CreateStep.DISCORD_INVITE && (
        <DiscordInvite server={server} onStartVerification={handleStartVerification} />
      )}
      {step === CreateStep.VERIFICATION && <ServerVerification server={server} isVerifying={isVerifying} />}
      {step === CreateStep.COMPLETE && <Complete addServerResponse={createGuildSuccessResponse} />}
    </Card>
  );
}
