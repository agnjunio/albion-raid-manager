import { normalizeContentType } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/core/types";

import { type Postprocessor } from "./types";

export const contentTypePostprocessor: Postprocessor = (context) => {
  const { aiData: responseData, preprocessedContext } = context;

  // Use AI's content type decision if provided, otherwise fall back to pipeline detection
  const aiContentType = responseData.contentType as string | undefined;
  const aiContentTypeConfidence = responseData.contentTypeConfidence as number | undefined;

  let finalContentType: ContentType;
  let finalContentTypeConfidence: number;

  if (aiContentType && aiContentTypeConfidence !== undefined) {
    // Use AI's decision, but normalize it to ensure it matches our enum
    const normalizedContentType = normalizeContentType(aiContentType);
    finalContentType = normalizedContentType || "OTHER";
    finalContentTypeConfidence = aiContentTypeConfidence;
  } else {
    // Fall back to pipeline detection
    finalContentType = preprocessedContext.preAssignedContentType?.type || "OTHER";
    finalContentTypeConfidence = preprocessedContext.preAssignedContentType?.confidence || 0.5;
  }

  return {
    ...context,
    aiData: {
      ...responseData,
      contentType: finalContentType,
      contentTypeConfidence: finalContentTypeConfidence,
    },
  };
};
