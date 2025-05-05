"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { APIRole } from "@albion-raid-manager/discord";
import { faChevronDown, faClose, faPeopleCarryBox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  roles: APIRole[];
  onRolesChange: (roles: APIRole[]) => void;
  value?: APIRole[];
}

export const RoleSelect = ({ roles, value = [], onRolesChange }: Props) => {
  const handleRoleSelect = (role: APIRole) => {
    if (!value.find((r) => r.id === role.id)) {
      const newRoles = [...value, role];
      onRolesChange(newRoles);
    }
  };

  const handleRoleRemove = (roleId: string) => {
    const newRoles = value.filter((r) => r.id !== roleId);
    onRolesChange(newRoles);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="hover:bg-accent/50 h-auto w-full items-center justify-start gap-2">
          <FontAwesomeIcon icon={faPeopleCarryBox} className="size-4" />

          <div className="flex grow flex-wrap gap-2">
            {!value || (!value.length && "Select roles")}
            {value.map((role) => (
              <div
                key={role.id}
                className={cn("bg-muted/50 flex items-center gap-1 rounded-xl px-2 text-sm")}
                style={{ color: role.color ? `#${role.color.toString(16)}` : "hsl(var(--foreground))" }}
              >
                {role.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleRemove(role.id);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faClose} className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <FontAwesomeIcon icon={faChevronDown} className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search roles..." autoFocus />
          <CommandList>
            <CommandEmpty>No roles found.</CommandEmpty>
            <CommandGroup>
              {roles
                .sort((a, b) => b.position - a.position)
                .map((role) => (
                  <CommandItem
                    key={role.id}
                    value={role.name}
                    onSelect={() => handleRoleSelect(role)}
                    className="cursor-pointer"
                  >
                    <span
                      className={cn("mr-2", role.color ? "text-foreground" : "text-muted-foreground")}
                      style={{ color: role.color ? `#${role.color.toString(16)}` : undefined }}
                    >
                      {role.name}
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
