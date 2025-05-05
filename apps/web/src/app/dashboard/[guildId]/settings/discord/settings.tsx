"use client";

import Loading from "@/app/loading";
import { RoleSelect } from "@/components/discord/role-select";
import { APIRole } from "@albion-raid-manager/discord";
import { useState } from "react";
import { useSettingsContext } from "../context";

export function DiscordSettings() {
  const { server } = useSettingsContext();
  const [raidRoles, setRaidRoles] = useState<APIRole[]>([]);
  const [compositionRoles, setCompositionRoles] = useState<APIRole[]>([]);
  const [botSettingsRoles, setBotSettingsRoles] = useState<APIRole[]>([]);

  if (!server) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Discord Permissions</h2>
        <p className="text-sm text-gray-500">Configure which roles can access different features of the bot.</p>
      </div>

      <div className="space-y-4">
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
            />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Bot Settings</h3>
          <p className="mt-1 text-sm text-gray-500">Roles that can modify bot settings</p>
          <div className="mt-3">
            <RoleSelect
              roles={server.roles}
              value={botSettingsRoles}
              onRolesChange={(roles) => setBotSettingsRoles(roles)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
