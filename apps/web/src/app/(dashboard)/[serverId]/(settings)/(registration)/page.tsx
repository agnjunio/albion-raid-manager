import { faBuilding, faHandshake, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { useSettingsForm } from "../hooks/use-settings-form";

export function RegistrationPage() {
  const { t } = useTranslation();
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-8 p-6">
          <FormField
            control={form.control}
            name="serverGuildId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faBuilding} className="text-primary h-4 w-4" />
                  </div>
                  {t("settings.registration.albionGuildId.title")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("settings.registration.albionGuildId.placeholder")}
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  {t("settings.registration.albionGuildId.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="memberRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faUser} className="text-primary h-4 w-4" />
                  </div>
                  {t("settings.registration.memberRoleId.title")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("settings.registration.memberRoleId.placeholder")}
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  {t("settings.registration.memberRoleId.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

          <FormField
            control={form.control}
            name="friendRoleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faHandshake} className="text-primary h-4 w-4" />
                  </div>
                  {t("settings.registration.friendRoleId.title")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("settings.registration.friendRoleId.placeholder")}
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-3 text-sm">
                  {t("settings.registration.friendRoleId.description")}
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
