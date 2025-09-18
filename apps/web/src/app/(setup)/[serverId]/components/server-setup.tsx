import { useCallback, useState } from "react";

import { APIErrorType, APIServer, VerifyServer } from "@albion-raid-manager/types/api";
import { useTranslation } from "react-i18next";

import Alert from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { isAPIError } from "@/lib/api";
import { translateError } from "@/lib/error-translations";
import { useAddServerMutation } from "@/store/servers";

import { Complete, DiscordInvite, ServerInfo, ServerVerification } from "./steps";

enum CreateStep {
  SERVER_INFO,
  DISCORD_INVITE,
  VERIFICATION,
  COMPLETE,
}

interface ServerSetupProps {
  server: APIServer;
}

export function ServerSetup({ server }: ServerSetupProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(CreateStep.SERVER_INFO);
  const [error, setError] = useState<string | null>(null);
  const [createGuildSuccessResponse, setCreateGuildSuccessResponse] = useState<VerifyServer.Response>();
  const [addServer] = useAddServerMutation();

  const STEP_LABELS = [
    t("setup.steps.serverInfo"),
    t("setup.steps.discordInvite"),
    t("setup.steps.verification"),
    t("setup.steps.complete"),
  ];

  const handleStartVerification = useCallback(async () => {
    setStep(CreateStep.VERIFICATION);
    setError(null);

    const body: VerifyServer.Body = {
      serverId: server.id,
    };

    const addServerResponse = await addServer({ body });
    if (addServerResponse.error) {
      const errorType = isAPIError(addServerResponse.error)
        ? addServerResponse.error.data
        : APIErrorType.SERVER_VERIFICATION_FAILED;
      setError(translateError(errorType));
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
        <CardTitle>{t("setup.title")}</CardTitle>
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
