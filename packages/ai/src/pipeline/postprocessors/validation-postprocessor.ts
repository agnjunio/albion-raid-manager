import { type Postprocessor } from "./types";

export const validationPostprocessor: Postprocessor = (context) => {
  const { aiResponse } = context;

  if (!aiResponse || typeof aiResponse !== "object") {
    return {
      ...context,
      metadata: {
        ...context.metadata,
        validationErrors: [...context.metadata.validationErrors, "Invalid data format"],
      },
    };
  }

  const aiData = aiResponse as Record<string, unknown>;

  return {
    ...context,
    aiData,
  };
};
