import { getDefaultLocation, getLocation } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/core/types";

import { type Postprocessor } from "./types";

export const locationPostprocessor: Postprocessor = (context) => {
  const { aiData, parsedData } = context;

  // Get default location for content type if no location provided
  let rawLocation = aiData.location;
  if (!rawLocation) {
    rawLocation = getDefaultLocation(aiData.contentType as ContentType);
  }

  // Normalize the location using the Location entity and store the key
  const location = getLocation(rawLocation);

  if (location.key === "UNKNOWN") {
    return null;
  }

  return {
    ...context,
    parsedData: { ...parsedData, location: location.key },
  };
};
