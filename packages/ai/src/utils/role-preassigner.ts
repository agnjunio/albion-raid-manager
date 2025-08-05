import { findRoleAssignment } from "~/dictionaries";

export interface PreAssignedRole {
  name: string;
  role: string; // The role enum value (TANK, HEALER, SUPPORT, etc.)
  confidence: number; // 0-1, how confident we are in this assignment
}

/**
 * Pre-assigns roles based on weapon/build knowledge
 * This ensures consistent role mapping regardless of AI interpretation
 */
export function preAssignRoles(slotNames: string[]): PreAssignedRole[] {
  const preAssigned: PreAssignedRole[] = [];

  for (const slotName of slotNames) {
    const assignment = findRoleAssignment(slotName);

    if (assignment) {
      preAssigned.push({
        name: slotName,
        role: assignment.role,
        confidence: assignment.confidence,
      });
    }
  }

  return preAssigned;
}
