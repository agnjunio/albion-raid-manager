import { getDefaultLocation } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/core/types";

import { type Postprocessor } from "./types";

/**
 * Processes location and requirements
 */
export const locationRequirementsPostprocessor: Postprocessor = (context) => {
  const { aiData: parsedData, preprocessedContext: pipelineContext } = context;

  // Use AI confidence without boosting/penalties
  const finalConfidence = Math.max(0, Math.min(1, (parsedData.confidence as number) || 0.5));

  // Get default location for content type if no location provided
  let finalLocation = parsedData.location as string | undefined;
  if (!finalLocation) {
    finalLocation = getDefaultLocation(parsedData.contentType as ContentType) || undefined;
  }

  // Extract requirements from message if not provided by AI
  let finalRequirements = (parsedData.requirements as string[] | undefined) || [];
  if (finalRequirements.length === 0) {
    finalRequirements = pipelineContext.extractedRequirements;
  }

  return {
    ...context,
    aiData: {
      ...parsedData,
      confidence: finalConfidence,
      location: finalLocation,
      requirements: finalRequirements,
    },
  };
};
