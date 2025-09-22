import { faClipboardList, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { DiscordChannelInput, ServerInfo } from "@/components/discord";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageError } from "@/components/ui/page";
import { Separator } from "@/components/ui/separator";

import { useSettingsForm } from "../hooks/use-settings-form";

export function AdministrationPage() {
  const { t } = useTranslation();
  const form = useSettingsForm();
  const { serverId } = useParams();

  if (!serverId) return <PageError error="Server ID is required" />;

  return (
    <Form {...form}>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-8 p-8">
          <div className="space-y-4">
            <div className="text-foreground mb-6 flex items-center gap-3 text-lg font-semibold">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <FontAwesomeIcon icon={faTag} className="text-primary h-4 w-4" />
              </div>
              {t("settings.administration.serverAdministration")}
            </div>

            <div className="flex justify-center">
              <ServerInfo serverId={serverId} />
            </div>

            <p className="text-muted-foreground text-center text-sm">
              {t("settings.administration.serverInfoDescription")}
            </p>
          </div>

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="auditChannelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faClipboardList} className="text-primary h-4 w-4" />
                  </div>
                  {t("settings.administration.auditChannel.title")}
                </FormLabel>
                <FormControl>
                  <DiscordChannelInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder={t("settings.administration.auditChannel.placeholder")}
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  {t("settings.administration.auditChannel.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </Form>
  );
}
