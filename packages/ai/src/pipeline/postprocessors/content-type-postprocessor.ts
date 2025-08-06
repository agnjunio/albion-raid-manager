import { normalizeContentType } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/core/types";

import { type Postprocessor } from "./types";

export const contentTypePostprocessor: Postprocessor = (context) => {
  const { aiData, preprocessedContext, parsedData } = context;

  const aiContentType = aiData.contentType;
  let contentType: ContentType;

  if (aiContentType) {
    const normalizedContentType = normalizeContentType(aiContentType);
    contentType = normalizedContentType || "OTHER";
  } else {
    contentType = preprocessedContext.preAssignedContentType?.type || "OTHER";
  }

  return {
    ...context,
    parsedData: {
      ...parsedData,
      contentType,
    },
  };
};
