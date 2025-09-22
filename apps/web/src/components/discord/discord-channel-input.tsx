import { useState } from "react";

import { ChannelType } from "@albion-raid-manager/types/entities";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faHashtag, faSpinner, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetServerChannelsQuery } from "@/store/servers";

import { Button } from "../ui/button";

interface DiscordChannelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DiscordChannelInput({
  value,
  onChange,
  placeholder = "Select a channel...",
  className,
  disabled = false,
}: DiscordChannelInputProps) {
  const { serverId } = useParams();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const {
    data: channelsData,
    isLoading,
    error,
  } = useGetServerChannelsQuery({ params: { serverId: serverId || "" } }, { skip: !serverId });

  const channels = channelsData?.channels || [];
  const selectedChannel = channels.find((channel) => channel.id === value);
  const selectedChannelCategory = selectedChannel?.parentId
    ? channels.find((channel) => channel.id === selectedChannel.parentId)
    : null;
  const filteredChannels = channels.filter(
    (channel) =>
      channel.type === ChannelType.TEXT &&
      (channel.name.toLowerCase().includes(searchValue.toLowerCase()) || channel.id.includes(searchValue)),
  );

  const handleSelect = (channelId: string) => {
    onChange(channelId);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
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
              value={selectedChannel ? `${selectedChannel.name}` : isLoading ? "Loading..." : value}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className={`pointer-events-none pl-10 pr-20 ${className}`}
              disabled={disabled}
              readOnly
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} className="text-muted-foreground h-4 w-4 animate-spin" />
              ) : selectedChannel ? (
                <FontAwesomeIcon icon={faHashtag} className="text-muted-foreground h-4 w-4" />
              ) : (
                <FontAwesomeIcon icon={faDiscord} className="text-muted-foreground h-4 w-4" />
              )}
            </div>
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
              {selectedChannelCategory && (
                <span className="text-muted-foreground text-sm">{selectedChannelCategory.name}</span>
              )}
              {selectedChannel && (
                <Button
                  type="button"
                  onClick={handleClear}
                  variant="ghost"
                  size="icon"
                  title="Clear selection"
                  className="hover:bg-destructive/15 hover:text-destructive"
                >
                  <FontAwesomeIcon icon={faX} className="size-3" />
                </Button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search channels..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading channels..." : error ? "Failed to load channels" : "No channels found."}
              </CommandEmpty>
              <CommandGroup>
                {filteredChannels.map((channel) => {
                  const channelCategory = channel.parentId ? channels.find((cat) => cat.id === channel.parentId) : null;

                  return (
                    <CommandItem
                      key={channel.id}
                      value={channel.id}
                      onSelect={() => handleSelect(channel.id)}
                      className="flex items-center gap-3"
                    >
                      <FontAwesomeIcon
                        icon={channel.type === ChannelType.VOICE ? faDiscord : faHashtag}
                        className="text-muted-foreground h-4 w-4"
                      />
                      <span className="flex-1">{channel.name}</span>
                      {channelCategory && <span className="text-muted-foreground text-xs">{channelCategory.name}</span>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
