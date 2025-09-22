import { APIRole } from "discord-api-types/v10";

export enum RoleType {
  ROLE = "ROLE",
  EMOJI = "EMOJI",
}

export type Role = {
  id: string;
  name: string;
  type: RoleType;
  color?: number;
  position: number;
  permissions: string;
};

export function fromDiscordRoles(discordRoles: APIRole[]): Role[] {
  return discordRoles
    .filter((role) => !role.managed) // Filter out managed roles (bot roles, etc.)
    .map((role) => ({
      id: role.id,
      name: role.name,
      type: RoleType.ROLE,
      color: role.color,
      position: role.position,
      permissions: role.permissions,
    }))
    .sort((a, b) => b.position - a.position);
}
