import { findRoleAssignment } from "../../dictionaries";

import { createPreprocessor, type PreAssignedRole, type Preprocessor } from "./";

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

export const rolePreprocessor: Preprocessor = createPreprocessor((context) => {
  const preAssignedRoles = preAssignRoles(context.extractedSlots);

  return {
    preAssignedRoles,
  };
});
