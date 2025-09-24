import { faBullhorn, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { DiscordChannelInput, DiscordRoleArrayInput } from "@/components/discord";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { SettingsLoading } from "../components/settings-loading";
import { useServerSettings } from "../contexts/server-settings-context";

export function RaidsPage() {
  const { t } = useTranslation();
  const { isLoading, form } = useServerSettings();

  if (isLoading) {
    return <SettingsLoading />;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <Card className="border-border/50 shadow-xl">
          <CardContent className="space-y-4 px-8 py-6">
            <FormField
              control={form.control}
              name="raidAnnouncementChannelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faBullhorn} className="text-primary h-4 w-4" />
                    </div>
                    {t("settings.raids.announcementChannel.title")}
                  </FormLabel>
                  <FormControl>
                    <DiscordChannelInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder={t("settings.raids.announcementChannel.placeholder")}
                      className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-2 text-sm">
                    {t("settings.raids.announcementChannel.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

            <FormField
              control={form.control}
              name="callerRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faShield} className="text-primary h-4 w-4" />
                    </div>
                    {t("settings.raids.callerRoles.title")}
                  </FormLabel>
                  <FormControl>
                    <DiscordRoleArrayInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("settings.raids.callerRoles.placeholder")}
                      className="focus:border-primary/50"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-3 text-sm">
                    {t("settings.raids.callerRoles.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </Form>
    </div>
  );
}
