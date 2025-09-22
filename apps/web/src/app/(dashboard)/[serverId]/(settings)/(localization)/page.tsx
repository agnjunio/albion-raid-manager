import { faGlobe, faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useSettingsForm } from "../hooks/use-settings-form";

export function LocalizationPage() {
  const { t } = useTranslation();
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <Card className="border-border/50 from-background to-muted/10 bg-gradient-to-br shadow-xl">
        <CardContent className="space-y-8 p-6">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-6 flex items-center gap-4 text-xl font-semibold">
                  <div className="from-primary/20 to-primary/10 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm">
                    <FontAwesomeIcon icon={faLanguage} className="text-primary h-5 w-5" />
                  </div>
                  {t("settings.localization.language.title")}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="focus:border-primary/50 h-14 border-2 text-lg font-medium shadow-lg transition-all duration-300 hover:scale-[1.01]">
                      <SelectValue placeholder={t("settings.localization.language.placeholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="shadow-xl">
                    <SelectItem value="en" className="py-3 text-base">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🇺🇸</span>
                        {t("settings.localization.languages.en")}
                      </div>
                    </SelectItem>
                    <SelectItem value="es" className="py-3 text-base">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🇪🇸</span>
                        {t("settings.localization.languages.es")}
                      </div>
                    </SelectItem>
                    <SelectItem value="fr" className="py-3 text-base">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🇫🇷</span>
                        {t("settings.localization.languages.fr")}
                      </div>
                    </SelectItem>
                    <SelectItem value="de" className="py-3 text-base">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🇩🇪</span>
                        {t("settings.localization.languages.de")}
                      </div>
                    </SelectItem>
                    <SelectItem value="pt" className="py-3 text-base">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🇵🇹</span>
                        {t("settings.localization.languages.pt")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-muted-foreground mt-4 text-base">
                  {t("settings.localization.language.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Info Card */}
          <div className="border-border/50 bg-muted/30 rounded-xl border p-6">
            <div className="flex items-start gap-4">
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                <FontAwesomeIcon icon={faGlobe} className="text-muted-foreground h-4 w-4" />
              </div>
              <div>
                <h4 className="text-foreground mb-2 font-semibold">
                  {t("settings.localization.languageSupport.title")}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t("settings.localization.languageSupport.description")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
