import { useEffect, useState } from "react";

import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import {
  faCheck,
  faFolder,
  faHashtag,
  faMicrophone,
  faNewspaper,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";

// Channel type mapping from Discord API to our types
const DISCORD_CHANNEL_TYPE_MAP: Record<number, DiscordChannel["type"]> = {
  0: "text", // GUILD_TEXT
  1: "text", // DM
  2: "voice", // GUILD_VOICE
  3: "text", // GROUP_DM
  4: "category", // GUILD_CATEGORY
  5: "news", // GUILD_NEWS
  10: "text", // GUILD_NEWS_THREAD
  11: "text", // GUILD_PUBLIC_THREAD
  12: "text", // GUILD_PRIVATE_THREAD
  13: "stage", // GUILD_STAGE_VOICE
  15: "forum", // GUILD_FORUM
};

interface DiscordChannel {
  id: string;
  name: string;
  type: "text" | "voice" | "category" | "news" | "stage" | "forum";
  parentId?: string;
  position?: number;
  topic?: string;
  nsfw?: boolean;
}

interface DiscordChannelGroup {
  id: string;
  name: string;
  channels: DiscordChannel[];
}

interface DiscordChannelPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  serverId?: string;
  channelTypes?: DiscordChannel["type"][];
  showChannelId?: boolean;
}

const getChannelIcon = (type: DiscordChannel["type"]) => {
  switch (type) {
    case "voice":
      return faVolumeHigh;
    case "category":
      return faFolder;
    case "news":
      return faNewspaper;
    case "stage":
      return faMicrophone;
    case "forum":
      return faDiscord;
    default:
      return faHashtag;
  }
};

const getChannelTypeColor = (type: DiscordChannel["type"]) => {
  switch (type) {
    case "voice":
      return "text-blue-500";
    case "category":
      return "text-gray-500";
    case "news":
      return "text-purple-500";
    case "stage":
      return "text-green-500";
    case "forum":
      return "text-orange-500";
    default:
      return "text-muted-foreground";
  }
};

export function DiscordChannelPicker({
  value,
  onChange,
  placeholder = "Select a channel...",
  className,
  disabled = false,
  serverId,
  channelTypes = ["text", "voice", "news", "stage", "forum"],
  showChannelId = true,
}: DiscordChannelPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter channels based on allowed types
  const filteredChannels = channels.filter(
    (channel) =>
      channelTypes.includes(channel.type) &&
      (channel.name.toLowerCase().includes(searchValue.toLowerCase()) || channel.id.includes(searchValue)),
  );

  // Group channels by category (if they have parentId)
  const channelGroups: DiscordChannelGroup[] = [];
  const ungroupedChannels: DiscordChannel[] = [];

  filteredChannels.forEach((channel) => {
    if (channel.parentId) {
      let group = channelGroups.find((g) => g.id === channel.parentId);
      if (!group) {
        // Find the category channel to get its name
        const categoryChannel = channels.find((c) => c.id === channel.parentId && c.type === "category");
        group = {
          id: channel.parentId!,
          name: categoryChannel?.name || `Category ${channel.parentId}`,
          channels: [],
        };
        channelGroups.push(group);
      }
      group.channels.push(channel);
    } else {
      ungroupedChannels.push(channel);
    }
  });

  const selectedChannel = channels.find((channel) => channel.id === value);

  // Load channels from Discord API when serverId is provided
  useEffect(() => {
    // Use mock data when no serverId is provided
    const mockChannels: DiscordChannel[] = [
      { id: "123456789012345678", name: "general", type: "text" },
      { id: "123456789012345679", name: "announcements", type: "text" },
      { id: "123456789012345680", name: "raid-announcements", type: "text" },
      { id: "123456789012345681", name: "raid-coordination", type: "text" },
      { id: "123456789012345682", name: "general-voice", type: "voice" },
      { id: "123456789012345683", name: "raid-voice", type: "voice" },
      { id: "123456789012345684", name: "news", type: "news" },
      { id: "123456789012345685", name: "stage-channel", type: "stage" },
      { id: "123456789012345686", name: "forum-discussion", type: "forum" },
    ];
    setChannels(mockChannels);
  }, [serverId]);

  const handleSelect = (channelId: string) => {
    onChange(channelId);
    setOpen(false);
    setSearchValue("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // If it looks like a channel ID, don't open the popover
    if (inputValue.match(/^\d{17,19}$/)) {
      setOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (!value || !value.match(/^\d{17,19}$/)) {
      setOpen(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 pl-10 pr-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          disabled={disabled}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {selectedChannel ? (
            <FontAwesomeIcon
              icon={getChannelIcon(selectedChannel.type)}
              className={`h-4 w-4 ${getChannelTypeColor(selectedChannel.type)}`}
            />
          ) : (
            <FontAwesomeIcon icon={faDiscord} className="text-muted-foreground h-4 w-4" />
          )}
        </div>
        {selectedChannel && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {open && (
        <div className="bg-popover text-popover-foreground absolute z-50 w-80 rounded-md border p-0 shadow-md">
          <Command>
            <CommandInput placeholder="Search channels..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="text-muted-foreground text-sm">Loading channels...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-6">
                  <div className="text-destructive text-sm">{error}</div>
                </div>
              ) : filteredChannels.length === 0 ? (
                <CommandEmpty>No channels found.</CommandEmpty>
              ) : (
                <>
                  {/* Ungrouped channels */}
                  {ungroupedChannels.length > 0 && (
                    <CommandGroup>
                      {ungroupedChannels.map((channel) => (
                        <CommandItem
                          key={channel.id}
                          value={channel.id}
                          onSelect={() => handleSelect(channel.id)}
                          className="flex items-center gap-3"
                        >
                          <FontAwesomeIcon
                            icon={getChannelIcon(channel.type)}
                            className={`h-4 w-4 ${getChannelTypeColor(channel.type)}`}
                          />
                          <span className="flex-1">{channel.name}</span>
                          {showChannelId && <span className="text-muted-foreground text-xs">{channel.id}</span>}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Grouped channels */}
                  {channelGroups.map((group) => (
                    <CommandGroup key={group.id} heading={group.name}>
                      {group.channels.map((channel) => (
                        <CommandItem
                          key={channel.id}
                          value={channel.id}
                          onSelect={() => handleSelect(channel.id)}
                          className="flex items-center gap-3"
                        >
                          <FontAwesomeIcon
                            icon={getChannelIcon(channel.type)}
                            className={`h-4 w-4 ${getChannelTypeColor(channel.type)}`}
                          />
                          <span className="flex-1">{channel.name}</span>
                          {showChannelId && <span className="text-muted-foreground text-xs">{channel.id}</span>}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}

      {selectedChannel && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-green-500" />
          <span>
            Selected:
            <FontAwesomeIcon
              icon={getChannelIcon(selectedChannel.type)}
              className={`ml-1 h-3 w-3 ${getChannelTypeColor(selectedChannel.type)}`}
            />
            {selectedChannel.type === "text" ? "#" : ""}
            {selectedChannel.name}
          </span>
        </div>
      )}
    </div>
  );
}
