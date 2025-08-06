import { RaidRole } from "../../types";
import { type Postprocessor } from "./types";

/**
 * Processes roles and user assignments
 */
export const rolesPostprocessor: Postprocessor = (context) => {
  const { aiData: parsedData } = context;

  // Normalize roles to ensure consistent user mention format
  const normalizedRoles = (parsedData.roles as RaidRole[] | undefined) || [];
  const processedRoles = normalizedRoles.map((role) => ({
    ...role,
    preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
  }));

  return {
    ...context,
    aiData: {
      ...parsedData,
      roles: processedRoles,
    },
  };
};
