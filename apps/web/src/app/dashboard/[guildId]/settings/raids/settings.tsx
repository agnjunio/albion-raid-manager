"use client";

import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { InputChannel } from "@/components/ui/input-channel";
import { translateErrorCode } from "@/lib/errors";
import { raidSettingsFormSchema } from "@/lib/schemas/settings";
import { Channel, ChannelType } from "@/types/discord";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function RaidSettings() {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof raidSettingsFormSchema>>({
    resolver: zodResolver(raidSettingsFormSchema),
    defaultValues: {},
  });
  const channels: Channel[] = [
    {
      id: "1",
      name: "Test",
    },
    {
      id: "2",
      name: "Chantelst",
      parentId: "1",
      type: ChannelType.TEXT,
    },
    {
      id: "3",
      name: "Ping",
      parentId: "1",
      type: ChannelType.TEXT,
    },
    {
      id: "4",
      name: "Avalon",
      parentId: "1",
      type: ChannelType.TEXT,
    },
    {
      id: "5",
      name: "Resultados",
      type: ChannelType.TEXT,
    },
  ];

  const handleSubmit = async (_data: z.infer<typeof raidSettingsFormSchema>) => {
    setError("NOT_IMPLEMENTED_YET");
  };

  return (
    <Card className="p-8">
      {error && <Alert>{translateErrorCode(error)}</Alert>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 lg:space-y-8">
          <FormField
            control={form.control}
            name="pingChannel.id"
            render={() => (
              <FormItem>
                <FormLabel>Pings Channel</FormLabel>
                <FormControl>
                  <InputChannel
                    placeholder="Enter pings channel..."
                    channels={channels}
                    onChannelChange={(channel) => {
                      form.setValue("pingChannel", channel);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex flex-row-reverse gap-2">
            <Button type="submit">Save</Button>
            <Link href={`/dashboard`} tabIndex={-1}>
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </Card>
  );
}
