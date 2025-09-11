import { useCallback, useState } from "react";

import { APIErrorType, APIServer, SetupServer } from "@albion-raid-manager/types/api";

import Alert from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { isAPIError } from "@/lib/api";
import { useAddServerMutation } from "@/store/servers";

import { Complete, DiscordInvite, ServerInfo, ServerVerification } from "./steps";

enum CreateStep {
  SERVER_INFO,
  DISCORD_INVITE,
  VERIFICATION,
  COMPLETE,
}

const STEP_LABELS = ["Server Info", "Discord Invite", "Verification", "Complete"];

interface ServerSetupProps {
  server: APIServer;
}

export function ServerSetup({ server }: ServerSetupProps) {
  const [step, setStep] = useState(CreateStep.SERVER_INFO);
  const [error, setError] = useState<string | null>(null);
  const [createGuildSuccessResponse, setCreateGuildSuccessResponse] = useState<SetupServer.Response>();
  const [addServer] = useAddServerMutation();

  const handleStartVerification = useCallback(async () => {
    setStep(CreateStep.VERIFICATION);
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
      return;
    }

    setError(null);
    setCreateGuildSuccessResponse(addServerResponse.data);
    setStep(CreateStep.COMPLETE);
  }, [server.id, addServer]);

  const handleNextStep = useCallback(() => {
    if (step === CreateStep.SERVER_INFO) {
      setStep(CreateStep.DISCORD_INVITE);
    }
  }, [step]);

  const handleStepClick = useCallback(
    (stepNumber: number) => {
      const targetStep = stepNumber - 1; // Convert from 1-based to 0-based
      if (targetStep < step) {
        setStep(targetStep);
        setError(null); // Clear any errors when going back
      }
    },
    [step],
  );

  return (
    <Card className="w-full min-w-[30vw]">
      <CardHeader className="space-y-4">
        {error && <Alert className="p-3">{error}</Alert>}
        <CardTitle>Server setup</CardTitle>
        <Stepper
          currentStep={step + 1}
          totalSteps={Object.keys(CreateStep).length / 2}
          stepLabels={STEP_LABELS}
          onStepClick={handleStepClick}
        />
      </CardHeader>

      {step === CreateStep.SERVER_INFO && <ServerInfo server={server} onNext={handleNextStep} />}
      {step === CreateStep.DISCORD_INVITE && (
        <DiscordInvite server={server} onStartVerification={handleStartVerification} />
      )}
      {step === CreateStep.VERIFICATION && <ServerVerification />}
      {step === CreateStep.COMPLETE && <Complete addServerResponse={createGuildSuccessResponse} />}
    </Card>
  );
}
