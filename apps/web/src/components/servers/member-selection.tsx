import type { APIServerMember } from "@albion-raid-manager/types/api";

import { useMemo, useState } from "react";

import { getUserPictureUrl } from "@albion-raid-manager/core/utils/discord";
import { faCheck, faSearch, faTimes, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MemberSelectionProps {
  members: APIServerMember[];
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

  const selectedMember = members.find((member) => member.id === selectedUserId);
  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const searchTerm = searchValue.toLowerCase();
        const username = member.username.toLowerCase();
        const nickname = member.nickname?.toLowerCase() || "";

        return username.includes(searchTerm) || nickname.includes(searchTerm);
      }),
    [members, searchValue],
  );

  const handleSelect = (userId: string | null) => {
    onSelect(userId);
    setOpen(false);
    setSearchValue("");
  };

  const handleClear = () => {
    onSelect(undefined);
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
          className="focus:border-primary/50 h-12 w-full justify-between border-2 text-base font-medium transition-colors"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {selectedMember ? (
              <MemberInfo member={selectedMember} />
            ) : (
              <>
                <FontAwesomeIcon icon={faUser} className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedMember && (
              <div
                className="hover:bg-destructive/2 0 hover:text-destructive-foreground flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear();
                  }
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
              </div>
            )}
            <FontAwesomeIcon icon={faSearch} className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command shouldFilter={false}>
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
                  key={member.id}
                  value={member.id}
                  onSelect={() => handleSelect(member.id)}
                  className="flex items-center gap-2"
                >
                  <MemberInfo member={member} />
                  {selectedUserId === member.id && <FontAwesomeIcon icon={faCheck} className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function MemberInfo({ member }: { member: APIServerMember }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={getUserPictureUrl(member.id, member.avatar)} />
        </Avatar>
      </div>
      <span className="truncate">{member.nickname || member.username}</span>
      {member.registered && (
        <Badge variant="secondary" className="text-xs">
          Registered
        </Badge>
      )}
    </>
  );
}
