import { ContentType } from "@albion-raid-manager/core/types";

import { ParsedRaidData, RaidRole } from "../../types";

import { type Postprocessor } from "./types";

/**
 * Creates the final ParsedRaidData object
 */
export const finalizePostprocessor: Postprocessor = (context) => {
  const { aiData: parsedData } = context;

  const finalResult: ParsedRaidData = {
    title: (parsedData.title as string) || "Raid",
    description: parsedData.description as string | undefined,
    date: parsedData.date as Date,
    location: parsedData.location as string | undefined,
    requirements: parsedData.requirements as string[],
    roles: parsedData.roles as RaidRole[],
    maxParticipants: parsedData.maxParticipants as number | undefined,
    notes: parsedData.notes as string | undefined,
    confidence: parsedData.confidence as number,
    contentType: parsedData.contentType as ContentType,
    contentTypeConfidence: parsedData.contentTypeConfidence as number,
  };

  return {
    ...context,
    data: finalResult,
  };
};
