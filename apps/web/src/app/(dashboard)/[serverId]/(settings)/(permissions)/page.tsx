import { faCrown, faMask, faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { DiscordRoleArrayInput } from "@/components/discord";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { useServerSettings } from "../contexts/server-settings-context";

export function PermissionsPage() {
  const { t } = useTranslation();
  const { form } = useServerSettings();

  return (
    <div className="space-y-6">
      <Form {...form}>
        <Card className="border-border/50 shadow-xl">
          <CardContent className="space-y-4 px-8 py-6">
            <FormField
              control={form.control}
              name="adminRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faCrown} className="text-primary h-4 w-4" />
                    </div>
                    {t("settings.permissions.adminRoles.title")}
                  </FormLabel>
                  <FormControl>
                    <DiscordRoleArrayInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("settings.permissions.adminRoles.placeholder")}
                      className="focus:border-primary/50"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-3 text-sm">
                    {t("settings.permissions.adminRoles.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

            <FormField
              control={form.control}
              name="raidRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faShield} className="text-primary h-4 w-4" />
                    </div>
                    {t("settings.permissions.raidRoles.title")}
                  </FormLabel>
                  <FormControl>
                    <DiscordRoleArrayInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("settings.permissions.raidRoles.placeholder")}
                      className="focus:border-primary/50"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-3 text-sm">
                    {t("settings.permissions.raidRoles.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

            <FormField
              control={form.control}
              name="compositionRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faMask} className="text-primary h-4 w-4" />
                    </div>
                    {t("settings.permissions.compositionRoles.title")}
                  </FormLabel>
                  <FormControl>
                    <DiscordRoleArrayInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t("settings.permissions.compositionRoles.placeholder")}
                      className="focus:border-primary/50"
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground mt-3 text-sm">
                    {t("settings.permissions.compositionRoles.description")}
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
