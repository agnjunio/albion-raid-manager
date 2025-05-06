"use client";

import { RoleSelect } from "@/components/discord/role-select";
import { useCallback, useMemo } from "react";
import { useSettingsContext } from "../context";

export function DiscordSettings() {
  const { server, guild, isLoading, setBotSettingsRoles, setRaidRoles, setCompositionRoles } = useSettingsContext();
  const transformRoleIdsToRoles = useCallback(
    (roleIds: string[]) =>
      roleIds.map((roleId) => server.roles.find((role) => role.id === roleId)).filter((role) => role !== undefined),
    [server.roles],
  );
  const botSettingsRoles = useMemo(
    () => transformRoleIdsToRoles(guild.adminRoles),
    [guild.adminRoles, transformRoleIdsToRoles],
  );
  const raidRoles = useMemo(() => transformRoleIdsToRoles(guild.raidRoles), [guild.raidRoles, transformRoleIdsToRoles]);
  const compositionRoles = useMemo(
    () => transformRoleIdsToRoles(guild.compositionRoles),
    [guild.compositionRoles, transformRoleIdsToRoles],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Discord Permissions</h2>
        <p className="text-sm text-gray-500">Configure which roles can access different features of the bot.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Bot Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Roles that can modify bot settings. Discord administrators always have this permission.
          </p>
          <div className="mt-3">
            <RoleSelect
              roles={server.roles}
              value={botSettingsRoles}
              onRolesChange={(roles) => setBotSettingsRoles(roles)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Raid Management</h3>
          <p className="mt-1 text-sm text-gray-500">Roles that can create and manage raids</p>
          <div className="mt-3">
            <RoleSelect
              roles={server.roles}
              value={raidRoles}
              onRolesChange={(roles) => {
                setRaidRoles(roles);
              }}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Composition Management</h3>
          <p className="mt-1 text-sm text-gray-500">Roles that can create and manage raid compositions</p>
          <div className="mt-3">
            <RoleSelect
              roles={server.roles}
              value={compositionRoles}
              onRolesChange={(roles) => setCompositionRoles(roles)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
