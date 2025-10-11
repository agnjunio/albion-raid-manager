import React, { useEffect, useState } from "react";

import { Channel, ChannelType } from "@albion-raid-manager/types/entities";
import { faChevronDown, faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentProps<"input"> {
  channels: Channel[];
  onChannelChange: (channel?: Channel) => void;
}

export const ChannelInput = ({ channels, value, onChannelChange, ...props }: Props) => {
  const { t } = useTranslation();
  const [matchedChannels, setMatchedChannels] = useState<Channel[]>(
    channels.filter((channel) => channel.type === ChannelType.TEXT),
  );
  const [inputText, setInputText] = useState("");
  const [category, setCategory] = useState("");
  const [autoComplete, setAutoComplete] = useState(false);

  useEffect(() => {
    const channel = channels.find((c) => c.id === value);
    if (channel) {
      setInputText(`#${channel.name}`);
    }
    if (channel?.parentId) {
      setCategory(channels.find((c) => c.id === channel.parentId)?.name || "");
    }
  }, [value, channels]);

  const setSelectedChannel = (channel?: Channel) => {
    setInputText(channel ? `#${channel.name}` : ``);
    if (channel?.parentId) {
      setCategory(channels.find((c) => c.id === channel.parentId)?.name || "");
    } else {
      setCategory("");
    }

    setAutoComplete(false);
    if (onChannelChange) onChannelChange(channel);
  };

  const handleInputChange = (value: string) => {
    setInputText(value);
    setMatchedChannels(
      channels
        .filter(
          (channel) =>
            channel.name.toLowerCase().includes(value.replace(/^#/, "").toLowerCase()) &&
            channel.type === ChannelType.TEXT,
        )
        .slice(0, 10),
    );
    setAutoComplete(true);
  };

  const handleMenuClick = () => {
    if (props.disabled) return;
    setAutoComplete(!autoComplete);
  };

  const handleClearClick = () => {
    if (props.disabled) return;
    setSelectedChannel();
  };

  const handleMenuOptionClick = (channel: Channel) => {
    if (props.disabled) return;
    setSelectedChannel(channel);
  };

  return (
    <div className={cn(props.className)}>
      <Command className="group">
        <div className="relative">
          <CommandInput
            searchIcon={false}
            value={inputText}
            onValueChange={handleInputChange}
            className={cn(
              "group-focus-within:border-ring group-focus-within:ring-ring/50 group-focus-within:ring-[3px]",
              {
                "rounded-b-none": autoComplete,
              },
            )}
            {...props}
          />
          <div className="absolute bottom-0 right-3 top-0 flex items-center gap-2">
            {category && <span className="input-overlay-category">{category}</span>}
            {inputText && <FontAwesomeIcon icon={faClose} onClick={() => handleClearClick()} />}
            <FontAwesomeIcon icon={faChevronDown} onClick={() => handleMenuClick()} />
          </div>
        </div>

        <CommandList
          className={cn("border-border group-focus-within:border-ring scroll-py-0 rounded-b-lg border border-t-0", {
            hidden: !autoComplete,
          })}
        >
          <CommandEmpty>{t("channel.noResultsFound")}</CommandEmpty>
          <CommandGroup>
            {matchedChannels.map((channel) => {
              const category = channels.find((c) => c.id === channel.parentId);

              return (
                <CommandItem key={channel.id} onSelect={() => handleMenuOptionClick(channel)}>
                  <div className="flex w-full items-center justify-between gap-2">
                    <span>#{channel.name}</span>
                    <span>{category?.name}</span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};
