import { getDictionaryForText } from "../../dictionaries";

import { createPreprocessor, type PreAssignedRole, type Preprocessor } from ".";

function findRoleAssignment(slotName: string): { role: string; confidence: number } | null {
  const dictionary = getDictionaryForText(slotName);
  const lowerSlot = slotName.toLowerCase();

  for (const [role, entry] of Object.entries(dictionary)) {
    if (entry.patterns.some((pattern) => lowerSlot.includes(pattern))) {
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
  const preAssignedRoles = preAssignRoles(context.extractedSlots);

  return {
    preAssignedRoles,
  };
});
