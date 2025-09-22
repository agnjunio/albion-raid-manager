import { useState } from "react";

import { Role } from "@albion-raid-manager/types/entities";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faCrown, faSpinner, faUsers, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hasPermissions, PERMISSIONS } from "@/lib/discord-utils";
import { useGetServerRolesQuery } from "@/store/servers";

interface DiscordRoleInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxRoles?: number;
  singleRole?: boolean;
}

export function DiscordRoleInput({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  maxRoles,
  singleRole = false,
}: DiscordRoleInputProps) {
  const { t } = useTranslation();
  const { serverId } = useParams();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const defaultPlaceholder = singleRole
    ? t("discord.roleInput.placeholder").replace("roles", "role")
    : t("discord.roleInput.placeholder");

  const {
    data: rolesData,
    isLoading,
    error,
  } = useGetServerRolesQuery({ params: { serverId: serverId || "" } }, { skip: !serverId });

  const roles = rolesData?.roles || [];
  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchValue.toLowerCase()) || role.id.includes(searchValue),
  );

  const handleSelectRole = (roleId: string) => {
    if (singleRole) {
      // For single role, replace the existing role
      onChange([roleId]);
    } else {
      // For multiple roles, add to the array if not already present
      if (!value.includes(roleId) && (!maxRoles || value.length < maxRoles)) {
        onChange([...value, roleId]);
      }
    }
    setOpen(false);
    setSearchValue("");
  };

  const handleRemoveRole = (roleIdToRemove: string) => {
    onChange(value.filter((roleId) => roleId !== roleIdToRemove));
  };

  const getRoleIcon = (role: Role) => {
    if (!role) {
      return faDiscord;
    }

    if (role.id === serverId) {
      return faUsers;
    }

    if (hasPermissions(role.permissions, [PERMISSIONS.ADMINISTRATOR])) {
      return faCrown;
    }

    return faDiscord;
  };

  const getRoleColor = (role: Role) => {
    if (!role || role.color === undefined || role.color === null || role.color === 0) {
      return undefined;
    }

    try {
      const colorNum = Number(role.color);
      if (isNaN(colorNum) || colorNum <= 0) {
        return undefined;
      }

      const hexColor = colorNum.toString(16).padStart(6, "0");
      if (hexColor === "000000") {
        return undefined; // Don't show black color dots
      }

      return `#${hexColor}`;
    } catch {
      return undefined;
    }
  };

  const canAddMore = singleRole ? value.length === 0 : !maxRoles || value.length < maxRoles;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Role selection input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  placeholder={placeholder || defaultPlaceholder}
                  className="focus:border-primary/50 pointer-events-none h-12 border-2 pl-12 pr-20 transition-all duration-200"
                  disabled={disabled || !canAddMore}
                  readOnly
                  value=""
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} className="text-muted-foreground h-4 w-4 animate-spin" />
                  ) : (
                    <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
                      <FontAwesomeIcon icon={faDiscord} className="text-primary h-3 w-3" />
                    </div>
                  )}
                </div>
                {!canAddMore && !singleRole && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-muted-foreground text-xs font-medium">
                      {maxRoles ? `${value.length}/${maxRoles}` : `${value.length} ${t("discord.roleInput.selected")}`}
                    </span>
                  </div>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="border-border/50 w-[var(--radix-popover-trigger-width)] p-0 shadow-xl"
              align="start"
            >
              <Command className="border-0">
                <CommandInput
                  placeholder={t("discord.roleInput.searchPlaceholder")}
                  value={searchValue}
                  onValueChange={setSearchValue}
                  className="border-0 focus:ring-0"
                />
                <CommandList className="max-h-64">
                  <CommandEmpty className="py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FontAwesomeIcon icon={faUsers} className="text-muted-foreground h-6 w-6" />
                      <span className="text-muted-foreground text-sm">
                        {isLoading
                          ? t("discord.roleInput.loading")
                          : error
                            ? t("discord.roleInput.failedToLoad")
                            : t("discord.roleInput.noRolesFound")}
                      </span>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredRoles.map((role) => (
                      <CommandItem
                        key={role.id}
                        value={role.id}
                        onSelect={() => handleSelectRole(role.id)}
                        disabled={!singleRole && value.includes(role.id)}
                        className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors"
                      >
                        <div className="relative">
                          <div className="bg-muted/50 flex h-7 w-7 items-center justify-center rounded-lg">
                            <FontAwesomeIcon icon={getRoleIcon(role)} className="text-muted-foreground h-4 w-4" />
                            {getRoleColor(role) && (
                              <div
                                className="border-background absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 shadow-sm"
                                style={{ backgroundColor: getRoleColor(role) }}
                              />
                            )}
                          </div>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-foreground truncate text-sm font-medium">{role.name}</span>
                        </div>
                        {!singleRole && value.includes(role.id) && (
                          <div className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-full">
                            <FontAwesomeIcon icon={faUsers} className="h-2 w-2" />
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Selected roles */}
      {value.length > 0 && (
        <Card className="border-border/50 from-background to-muted/20 bg-gradient-to-br shadow-sm">
          <CardContent className="px-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                  <FontAwesomeIcon icon={faUsers} className="text-primary h-3 w-3" />
                </div>
                <span className="text-foreground text-sm font-medium">
                  {t("discord.roleInput.selectedRoles")} ({value.length})
                </span>
              </div>

              <div className="grid gap-2">
                {value.map((roleId, index) => {
                  const role = roles.find((r) => r.id === roleId);
                  return (
                    <div
                      key={roleId}
                      className="border-border/50 from-muted/30 to-muted/10 hover:border-border group relative overflow-hidden rounded-lg border bg-gradient-to-r p-3 transition-all duration-200 hover:shadow-sm"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "fadeInUp 0.3s ease-out forwards",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="bg-background/80 border-border/50 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm">
                              <FontAwesomeIcon
                                icon={role ? getRoleIcon(role) : faDiscord}
                                className="text-muted-foreground h-4 w-4"
                              />
                              {role && getRoleColor(role) && (
                                <div
                                  className="border-background absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 shadow-sm"
                                  style={{ backgroundColor: getRoleColor(role) }}
                                />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-foreground text-sm font-medium">
                              {role?.name || (isLoading ? t("discord.roleInput.loadingRole") : roleId)}
                            </span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleRemoveRole(roleId)}
                          disabled={disabled}
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/15 hover:text-destructive h-7 w-7 opacity-0 transition-all duration-200 group-hover:opacity-100"
                        >
                          <FontAwesomeIcon icon={faX} className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Subtle gradient overlay */}
                      <div className="to-background/5 pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent" />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Helper text */}
      {maxRoles && (
        <p className="text-muted-foreground text-xs">
          {value.length}/{maxRoles} {t("discord.roleInput.rolesSelected")}
        </p>
      )}
    </div>
  );
}
