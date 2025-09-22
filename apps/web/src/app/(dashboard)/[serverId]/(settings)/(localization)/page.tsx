import { faCheck, faGlobe, faRobot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useServerSettings } from "../contexts/server-settings-context";

export function LocalizationPage() {
  const { t, i18n } = useTranslation();
  const { form } = useServerSettings();

  // Get available languages from i18n configuration
  const availableLanguages = (i18n.options.supportedLngs as string[])?.filter((lng: string) => lng !== "cimode") || [
    "en",
  ];

  const languages = availableLanguages.map((code: string) => {
    switch (code) {
      case "en":
        return { code, name: t("settings.localization.languages.en"), flag: "🇺🇸", native: "English" };
      case "pt-BR":
        return { code, name: t("settings.localization.languages.pt"), flag: "🇧🇷", native: "Português" };
      default:
        return { code, name: code.toUpperCase(), flag: "🌐", native: code };
    }
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <Card className="border-border/50 shadow-xl">
          <CardContent className="space-y-4 px-8 py-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faGlobe} className="text-primary h-4 w-4" />
                    </div>
                    {t("settings.localization.language.title")}
                  </FormLabel>
                  <FormDescription className="text-muted-foreground mt-2 text-sm">
                    {t("settings.localization.language.description")}
                  </FormDescription>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="focus:border-primary/50 h-12 border-2 transition-all duration-200">
                        <SelectValue placeholder={t("settings.localization.language.placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="shadow-xl">
                        {languages.map((language: { code: string; name: string; flag: string; native: string }) => (
                          <SelectItem key={language.code} value={language.code} className="py-3">
                            <div className="flex w-full items-center gap-3">
                              <span className="text-lg">{language.flag}</span>
                              <div className="font-medium">{language.native}</div>
                              {field.value === language.code && (
                                <FontAwesomeIcon icon={faCheck} className="text-primary ml-auto h-4 w-4" />
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bot Language Notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faRobot} className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    {t("settings.localization.botOnly.title")}
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t("settings.localization.botOnly.description")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  );
}
