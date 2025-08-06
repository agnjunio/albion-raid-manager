export * from "./types";

export { contentTypePostprocessor } from "./content-type-postprocessor";
export { dateTimePostprocessor } from "./datetime-postprocessor";
export { finalizePostprocessor } from "./finalize-postprocessor";
export { locationRequirementsPostprocessor } from "./location-requirements-postprocessor";
export { rolesPostprocessor } from "./roles-postprocessor";
export { validationPostprocessor } from "./validation-postprocessor";

import { ParsedRaidData } from "../../types";
import { PreprocessorContext } from "../preprocessors";

import { contentTypePostprocessor } from "./content-type-postprocessor";
import { dateTimePostprocessor } from "./datetime-postprocessor";
import { finalizePostprocessor } from "./finalize-postprocessor";
import { locationRequirementsPostprocessor } from "./location-requirements-postprocessor";
import { rolesPostprocessor } from "./roles-postprocessor";
import { Postprocessor, PostprocessorContext } from "./types";
import { validationPostprocessor } from "./validation-postprocessor";

export const DEFAULT_POSTPROCESSORS: Postprocessor[] = [
  validationPostprocessor,
  dateTimePostprocessor,
  rolesPostprocessor,
  contentTypePostprocessor,
  locationRequirementsPostprocessor,
  finalizePostprocessor,
];

export function processAIResponse(
  aiResponse: unknown,
  originalMessage: string,
  preprocessedContext: PreprocessorContext,
  postprocessors: Postprocessor[] = DEFAULT_POSTPROCESSORS,
): ParsedRaidData {
  const startTime = Date.now();

  // Initialize context
  const initialContext: PostprocessorContext = {
    originalMessage,
    preprocessedContext,
    aiResponse,
    aiData: {},
    data: null,
    metadata: {
      processingTime: 0,
      validationErrors: [],
      confidence: 0,
    },
  };

  // Run through all postprocessors
  const finalContext = postprocessors.reduce((context, postprocessor) => {
    return postprocessor(context);
  }, initialContext);

  // Update processing time
  finalContext.metadata.processingTime = Date.now() - startTime;

  if (!finalContext.data) {
    throw new Error("Failed to process AI response");
  }

  return finalContext.data;
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
