import { useState } from "react";

import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCheck, faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DiscordChannel {
  id: string;
  name: string;
  type: "text" | "voice" | "category";
}

interface DiscordChannelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Mock channels data - in real implementation, this would come from Discord API
const mockChannels: DiscordChannel[] = [
  { id: "123456789012345678", name: "general", type: "text" },
  { id: "123456789012345679", name: "announcements", type: "text" },
  { id: "123456789012345680", name: "raid-announcements", type: "text" },
  { id: "123456789012345681", name: "raid-coordination", type: "text" },
  { id: "123456789012345682", name: "general-voice", type: "voice" },
  { id: "123456789012345683", name: "raid-voice", type: "voice" },
];

export function DiscordChannelInput({
  value,
  onChange,
  placeholder = "Select a channel...",
  className,
  disabled = false,
}: DiscordChannelInputProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedChannel = mockChannels.find((channel) => channel.id === value);
  const filteredChannels = mockChannels.filter(
    (channel) => channel.name.toLowerCase().includes(searchValue.toLowerCase()) || channel.id.includes(searchValue),
  );

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={value}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className={`pl-10 ${className}`}
              disabled={disabled}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {selectedChannel ? (
                <FontAwesomeIcon icon={faHashtag} className="text-muted-foreground h-4 w-4" />
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
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search channels..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandEmpty>No channels found.</CommandEmpty>
              <CommandGroup>
                {filteredChannels.map((channel) => (
                  <CommandItem
                    key={channel.id}
                    value={channel.id}
                    onSelect={() => handleSelect(channel.id)}
                    className="flex items-center gap-3"
                  >
                    <FontAwesomeIcon
                      icon={channel.type === "voice" ? faDiscord : faHashtag}
                      className="text-muted-foreground h-4 w-4"
                    />
                    <span className="flex-1">{channel.name}</span>
                    <span className="text-muted-foreground text-xs">{channel.id}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedChannel && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-green-500" />
          <span>Selected: #{selectedChannel.name}</span>
        </div>
      )}
    </div>
  );
}
