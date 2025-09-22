import { faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { DiscordChannelInput } from "@/components/discord";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
      <Card className="border-border/50 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <FormField
            control={form.control}
            name="raidAnnouncementChannelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <FontAwesomeIcon icon={faBullhorn} className="text-primary h-4 w-4" />
                  </div>
                  Raid Announcement Channel
                </FormLabel>
                <FormControl>
                  <DiscordChannelInput
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Channel ID for raid announcements"
                    className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                  />
                </FormControl>
                <FormDescription className="text-muted-foreground mt-2 text-sm">
                  Discord channel where raid announcements will be posted. You can find the channel ID by right-clicking
                  on a channel and selecting "Copy ID" (Developer Mode must be enabled).
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
