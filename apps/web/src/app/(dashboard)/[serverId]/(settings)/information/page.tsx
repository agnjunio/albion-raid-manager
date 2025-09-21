import { Form } from "@/components/ui/form";

import { AdministrationSection } from "../components/administration-section";
import { useSettingsForm } from "../hooks/use-settings-form";

export function AdministrationPage() {
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <AdministrationSection form={form} />
    </Form>
  );
}
