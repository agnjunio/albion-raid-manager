import { Form } from "@/components/ui/form";

import { RaidsSection } from "../components/raids-section";
import { SettingsLoading } from "../components/settings-loading";
import { useServerSettings } from "../contexts/server-settings-context";
import { useSettingsForm } from "../hooks/use-settings-form";

export function RaidsPage() {
  const { isLoading } = useServerSettings();
  const form = useSettingsForm();

  if (isLoading) {
    return <SettingsLoading />;
  }

  return (
    <Form {...form}>
      <RaidsSection form={form} />
    </Form>
  );
}
