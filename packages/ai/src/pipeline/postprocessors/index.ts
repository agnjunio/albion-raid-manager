export * from "./types";

import { AiRaid, ParsedRaidData } from "../../types";
import { PreprocessorContext } from "../preprocessors";

import { basicPostprocessor } from "./basic-postprocessor";
import { contentTypePostprocessor } from "./content-type-postprocessor";
import { dateTimePostprocessor } from "./datetime-postprocessor";
import { locationPostprocessor } from "./location-postprocessor";
import { rolesPostprocessor } from "./roles-postprocessor";
import { Postprocessor, PostprocessorContext } from "./types";

export const DEFAULT_POSTPROCESSORS: Postprocessor[] = [
  basicPostprocessor,
  contentTypePostprocessor,
  locationPostprocessor,
  dateTimePostprocessor,
  rolesPostprocessor,
];

export function processAIResponse(
  aiData: AiRaid,
  originalMessage: string,
  preprocessedContext: PreprocessorContext,
  postprocessors: Postprocessor[] = DEFAULT_POSTPROCESSORS,
): ParsedRaidData {
  const startTime = Date.now();

  // Initialize context
  const initialContext: PostprocessorContext = {
    originalMessage,
    preprocessedContext,
    aiData,
    parsedData: {
      title: "",
      date: new Date(),
      confidence: 0,
      notes: "",
    },
    metadata: {
      processingTime: 0,
      validationErrors: [],
      confidence: 0,
    },
  };

  const confidenceBoost = 1 / postprocessors.length;
  const finalContext = postprocessors.reduce((context, postprocessor) => {
    const result = postprocessor(context);
    if (!result) {
      return context;
    }
    result.parsedData.confidence += confidenceBoost;
    return result;
  }, initialContext);

  finalContext.metadata.processingTime = Date.now() - startTime;

  if (finalContext.parsedData.confidence < 0.5) {
    throw new Error("Failed to process AI response");
  }

  return finalContext.parsedData;
}

export function processValidationResponse(validationResponse: unknown): boolean {
  if (typeof validationResponse === "string") {
    const normalizedResponse = validationResponse.toLowerCase().trim();
    return normalizedResponse === "true";
  }

  if (typeof validationResponse === "boolean") {
    return validationResponse;
  }

  return false;
}
