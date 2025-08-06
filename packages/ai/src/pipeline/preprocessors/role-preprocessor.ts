import { getRoleDictionaryForText } from "../../dictionaries";

import { createPreprocessor, type PreAssignedRole, type Preprocessor } from ".";

function findRoleAssignment(slotName: string): { role: string; confidence: number } | null {
  const dictionary = getRoleDictionaryForText(slotName);
  const lowerSlot = slotName.toLowerCase();

  for (const [role, entry] of Object.entries(dictionary)) {
    const matchedPattern = entry.patterns.find((pattern) => lowerSlot.includes(pattern));
    if (matchedPattern) {
      return {
        role,
        confidence: entry.confidence,
      };
    }
  }

  return null;
}

function preAssignRoles(slotNames: string[]): PreAssignedRole[] {
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

export const rolePreprocessor: Preprocessor = createPreprocessor((context) => {
  // Get new role assignments from extracted slots
  const newRoleAssignments = preAssignRoles(context.extractedSlots);

  // Create a map of existing roles by name for quick lookup
  const existingRolesByName = new Map(context.preAssignedRoles.map((role) => [role.name, role]));

  // Combine existing and new roles, with new roles taking precedence for the same slot name
  const combinedRoles = [...context.preAssignedRoles];

  // Add new roles that don't exist in the existing roles
  for (const newRole of newRoleAssignments) {
    if (!existingRolesByName.has(newRole.name)) {
      combinedRoles.push(newRole);
    }
  }

  return {
    preAssignedRoles: combinedRoles,
  };
});
