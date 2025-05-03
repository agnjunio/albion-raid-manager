"use client";

import { InputChannel } from "@/components/ui/input-channel";
import { Channel, ChannelType } from "@/types/discord";

export function RaidSettings() {
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
  return (
    <div>
      <InputChannel placeholder="Pings channel" channels={channels} onChannelChange={() => {}} />
    </div>
  );
}
