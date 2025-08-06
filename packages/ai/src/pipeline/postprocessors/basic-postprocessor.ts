import { type Postprocessor } from "./types";

/**
 * Processes title, location and requirements
 */
export const basicPostprocessor: Postprocessor = (context) => {
  const { aiData, preprocessedContext, parsedData } = context;

  // Get default title if no title provided
  let title = aiData.title;
  if (!title) {
    title = "Raid";
  }

  // Extract requirements from message if not provided by AI
  let requirements = aiData.requirements;
  if (!requirements || requirements.length === 0) {
    requirements = preprocessedContext.extractedRequirements;
  }

  return {
    ...context,
    parsedData: {
      ...parsedData,
      title,
      requirements,
    },
  };
};
