import type { UseFormReturn } from "react-hook-form";

import { faClipboardList, faTag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";

import { DiscordChannelInput, ServerInfo } from "@/components/discord";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PageError } from "@/components/ui/page";
import { Separator } from "@/components/ui/separator";

import { ServerSettingsFormData } from "../schemas";

interface AdministrationSectionProps {
  form: UseFormReturn<ServerSettingsFormData>;
}

export function AdministrationSection({ form }: AdministrationSectionProps) {
  const { serverId } = useParams();

  if (!serverId) return <PageError error="Server ID is required" />;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="space-y-8 p-8">
        <div className="space-y-4">
          <div className="text-foreground mb-6 flex items-center gap-3 text-lg font-semibold">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <FontAwesomeIcon icon={faTag} className="text-primary h-4 w-4" />
            </div>
            Server Administration
          </div>

          <div className="flex justify-center">
            <ServerInfo serverId={serverId} />
          </div>

          <p className="text-muted-foreground text-center text-sm">
            Server information is managed by Discord and cannot be changed here
          </p>
        </div>

        <Separator className="via-border bg-gradient-to-r from-transparent to-transparent" />

        <FormField
          control={form.control}
          name="auditChannelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground mb-4 flex items-center gap-3 text-lg font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <FontAwesomeIcon icon={faClipboardList} className="text-primary h-4 w-4" />
                </div>
                Audit Channel
              </FormLabel>
              <FormControl>
                <DiscordChannelInput
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Channel ID for audit logs"
                  className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-all duration-200"
                />
              </FormControl>
              <FormDescription className="text-muted-foreground mt-3 text-sm">
                Channel where audit logs for all bot activities will be posted
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
