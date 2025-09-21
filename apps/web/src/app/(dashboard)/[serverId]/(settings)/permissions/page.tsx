import { Form } from "@/components/ui/form";

import { PermissionsSection } from "../components/permissions-section";
import { useSettingsForm } from "../hooks/use-settings-form";

export function PermissionsPage() {
  const form = useSettingsForm();

  return (
    <Form {...form}>
      <PermissionsSection form={form} />
    </Form>
  );
}
