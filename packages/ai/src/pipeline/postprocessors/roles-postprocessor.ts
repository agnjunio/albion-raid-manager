import { RaidRole } from "../../types";

import { type Postprocessor } from "./types";

/**
 * Processes roles and user assignments
 */
export const rolesPostprocessor: Postprocessor = (context) => {
  const { aiData } = context;

  // Normalize roles to ensure consistent user mention format
  const normalizedRoles = (aiData.roles as RaidRole[] | undefined) || [];
  const processedRoles = normalizedRoles.map((role) => ({
    ...role,
    preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
  }));

  return {
    ...context,
    aiData: {
      ...aiData,
      roles: processedRoles,
    },
  };
};
