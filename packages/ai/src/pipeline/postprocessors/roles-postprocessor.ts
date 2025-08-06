import { type Postprocessor } from "./types";

export const rolesPostprocessor: Postprocessor = (context) => {
  const { aiData, parsedData } = context;

  const normalizedRoles = aiData.roles || [];
  const roles = normalizedRoles.map((role) => ({
    ...role,
    preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
    count: 1,
  }));

  return {
    ...context,
    parsedData: {
      ...parsedData,
      roles,
    },
  };
};
