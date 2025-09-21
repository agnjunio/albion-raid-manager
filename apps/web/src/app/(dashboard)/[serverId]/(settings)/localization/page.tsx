import { Form } from "@/components/ui/form";

import { LocalizationSection } from "../components/localization-section";
import { useSettingsForm } from "../hooks/use-settings-form";

export function LocalizationPage() {
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <LocalizationSection form={form} />
    </Form>
  );
}
