import type { ServerMemberWithRegistration } from "@albion-raid-manager/types/api";

import { useState } from "react";

import { faCheck, faSearch, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MemberSelectionProps {
  members: ServerMemberWithRegistration[];
  selectedUserId?: string | null | undefined;
  onSelect: (userId: string | null | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MemberSelection({
  members,
  selectedUserId,
  onSelect,
  placeholder = "Select a member...",
  disabled = false,
}: MemberSelectionProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedMember = members.find((member) => member.user.id === selectedUserId);

  // Simple local search on member names (as per user preference)
  const filteredMembers = members.filter((member) => {
    const searchTerm = searchValue.toLowerCase();
    const username = member.user.username.toLowerCase();
    const displayName = (member.nick || member.user.username).toLowerCase();

    return username.includes(searchTerm) || displayName.includes(searchTerm);
  });

  const handleSelect = (userId: string | null) => {
    onSelect(userId);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onSelect(null);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedMember ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedMember.user.avatar || undefined} />
                  <AvatarFallback>
                    <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{selectedMember.nick || selectedMember.user.username}</span>
                {selectedMember.isRegistered && (
                  <Badge variant="secondary" className="text-xs">
                    Registered
                  </Badge>
                )}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUser} className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            {selectedMember && (
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-destructive hover:text-destructive-foreground h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </Button>
            )}
            <FontAwesomeIcon icon={faSearch} className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search members..." value={searchValue} onValueChange={setSearchValue} />
          <CommandList>
            <CommandEmpty>No members found.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="unassigned" onSelect={() => handleSelect(null)} className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Unassigned</span>
                {!selectedUserId && <FontAwesomeIcon icon={faCheck} className="ml-auto h-4 w-4" />}
              </CommandItem>
              {filteredMembers.map((member) => (
                <CommandItem
                  key={member.user.id}
                  value={member.user.id}
                  onSelect={() => handleSelect(member.user.id)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.user.avatar || undefined} />
                    <AvatarFallback>
                      <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 items-center gap-2">
                    <span className="truncate">{member.nick || member.user.username}</span>
                    {member.isRegistered && (
                      <Badge variant="secondary" className="text-xs">
                        Registered
                      </Badge>
                    )}
                  </div>
                  {selectedUserId === member.user.id && <FontAwesomeIcon icon={faCheck} className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
