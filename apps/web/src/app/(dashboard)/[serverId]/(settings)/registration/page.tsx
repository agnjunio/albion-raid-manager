import { Form } from "@/components/ui/form";

import { RegistrationSection } from "../components/registration-section";
import { useSettingsForm } from "../hooks/use-settings-form";

export function RegistrationPage() {
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <RegistrationSection form={form} />
    </Form>
  );
}
