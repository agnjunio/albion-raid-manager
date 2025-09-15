import { useTranslation } from "react-i18next";

import { CardContent } from "@/components/ui/card";
import Loading from "@/components/ui/loading";

export function ServerVerification() {
  const { t } = useTranslation();

  return (
    <CardContent>
      <Loading label={t("setup.verification.loading")} />
    </CardContent>
  );
}
