import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@albion-raid-manager/core/helpers";
import { type APIRole } from "@albion-raid-manager/discord";
import { faCheck, faChevronDown, faClose, faPeopleCarryBox } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  roles: APIRole[];
  onRolesChange: (roles: APIRole[]) => void;
  value?: APIRole[];
  disabled?: boolean;
}

export const RoleSelect = ({ roles, value = [], disabled = false, onRolesChange }: Props) => {
  const handleRoleSelect = (role: APIRole) => {
    const exists = value.find((r) => r.id === role.id);
    if (exists) {
      const newRoles = value.filter((r) => r.id !== role.id);
      onRolesChange(newRoles);
    } else {
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
        <Button
          variant="outline"
          className="hover:bg-accent/50 h-auto w-full items-center justify-start gap-2"
          disabled={disabled}
        >
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
                <div
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRoleRemove(role.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleRemove(role.id);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FontAwesomeIcon icon={faClose} className="h-3 w-3" />
                </div>
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
                    className="flex cursor-pointer justify-between gap-2"
                  >
                    <span
                      className={cn("mr-2", role.color ? "text-foreground" : "text-muted-foreground")}
                      style={{ color: role.color ? `#${role.color.toString(16)}` : undefined }}
                    >
                      {role.name}
                    </span>
                    {value.find((r) => r.id === role.id) && <FontAwesomeIcon icon={faCheck} className="size-4" />}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
