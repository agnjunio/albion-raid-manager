import { getDefaultLocation, normalizeContentType } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/core/types";

import { ParsedRaidData, RaidRole } from "../../types";

/**
 * Context object for post-processing AI responses
 */
export interface PostprocessorContext {
  // Original message and pipeline context
  originalMessage: string;
  pipelineContext: any; // PreprocessorContext from pipeline

  // Raw AI response
  aiResponse: unknown;

  // Post-processed data
  parsedData: Record<string, unknown>;

  // Final parsed result
  finalResult: ParsedRaidData | null;

  // Metadata about the post-processing
  metadata: {
    processingTime: number;
    validationErrors: string[];
    confidence: number;
  };
}

/**
 * Postprocessor function type - takes context and returns modified context
 */
export type Postprocessor = (context: PostprocessorContext) => PostprocessorContext;

/**
 * Validates and transforms raw AI response data
 */
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

  const parsedData = aiResponse as Record<string, unknown>;

  return {
    ...context,
    parsedData,
  };
};

/**
 * Processes date and time information
 */
export const dateTimePostprocessor: Postprocessor = (context) => {
  const { parsedData, pipelineContext } = context;

  // Parse and combine date and time into full datetime
  let raidDateTime = new Date();
  raidDateTime.setHours(0, 0, 0, 0); // Default to start of today

  const aiDate = parsedData.date as string | undefined;
  const aiTime = parsedData.time as string | undefined;

  if (aiDate) {
    try {
      // Try to parse the AI's date response as a full datetime
      const parsedDate = new Date(aiDate);
      if (!isNaN(parsedDate.getTime())) {
        raidDateTime = parsedDate;
      }
    } catch {
      console.warn("Failed to parse AI date:", aiDate);
    }
  }

  // If AI provided separate time, combine it with the date
  if (aiTime && aiTime !== "Not specified") {
    try {
      // Parse time in various formats
      let hours = 0;
      let minutes = 0;
      // Try HH:MM format
      const timeMatch = aiTime.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
      } else {
        // Try HHh format
        const hourMatch = aiTime.match(/(\d{1,2})h/);
        if (hourMatch) {
          hours = parseInt(hourMatch[1], 10);
        } else {
          // Try just HH format
          const justHourMatch = aiTime.match(/^(\d{1,2})$/);
          if (justHourMatch) {
            hours = parseInt(justHourMatch[1], 10);
          }
        }
      }

      // Set the time on the raid date
      raidDateTime.setHours(hours, minutes, 0, 0);
    } catch {
      console.warn("Failed to parse AI time:", aiTime);
    }
  }

  // Extract time from message if not provided by AI
  if (pipelineContext.extractedTime && (!aiTime || aiTime === "Not specified")) {
    // Parse the extracted time string
    const timeMatch = pipelineContext.extractedTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      raidDateTime.setHours(hours, minutes, 0, 0);
    }
  }

  return {
    ...context,
    parsedData: {
      ...parsedData,
      date: raidDateTime,
    },
  };
};

/**
 * Processes roles and user assignments
 */
export const rolesPostprocessor: Postprocessor = (context) => {
  const { parsedData } = context;

  // Normalize roles to ensure consistent user mention format
  const normalizedRoles = (parsedData.roles as RaidRole[] | undefined) || [];
  const processedRoles = normalizedRoles.map((role) => ({
    ...role,
    preAssignedUser: typeof role.preAssignedUser === "string" ? role.preAssignedUser : undefined,
  }));

  return {
    ...context,
    parsedData: {
      ...parsedData,
      roles: processedRoles,
    },
  };
};

/**
 * Processes content type and confidence
 */
export const contentTypePostprocessor: Postprocessor = (context) => {
  const { parsedData, pipelineContext } = context;

  // Use AI's content type decision if provided, otherwise fall back to pipeline detection
  const aiContentType = parsedData.contentType as string | undefined;
  const aiContentTypeConfidence = parsedData.contentTypeConfidence as number | undefined;

  let finalContentType: ContentType;
  let finalContentTypeConfidence: number;

  if (aiContentType && aiContentTypeConfidence !== undefined) {
    // Use AI's decision, but normalize it to ensure it matches our enum
    const normalizedContentType = normalizeContentType(aiContentType);
    finalContentType = normalizedContentType || "OTHER";
    finalContentTypeConfidence = aiContentTypeConfidence;
  } else {
    // Fall back to pipeline detection
    finalContentType = pipelineContext.preAssignedContentType?.type || "OTHER";
    finalContentTypeConfidence = pipelineContext.preAssignedContentType?.confidence || 0.5;
  }

  return {
    ...context,
    parsedData: {
      ...parsedData,
      contentType: finalContentType,
      contentTypeConfidence: finalContentTypeConfidence,
    },
  };
};

/**
 * Processes location and requirements
 */
export const locationRequirementsPostprocessor: Postprocessor = (context) => {
  const { parsedData, pipelineContext } = context;

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
    parsedData: {
      ...parsedData,
      confidence: finalConfidence,
      location: finalLocation,
      requirements: finalRequirements,
    },
  };
};

/**
 * Creates the final ParsedRaidData object
 */
export const finalizePostprocessor: Postprocessor = (context) => {
  const { parsedData } = context;

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
    finalResult,
  };
};

/**
 * Default postprocessor pipeline
 */
export const DEFAULT_POSTPROCESSORS: Postprocessor[] = [
  validationPostprocessor,
  dateTimePostprocessor,
  rolesPostprocessor,
  contentTypePostprocessor,
  locationRequirementsPostprocessor,
  finalizePostprocessor,
];

/**
 * Processes AI response through the postprocessor pipeline
 */
export function processAIResponse(
  aiResponse: unknown,
  originalMessage: string,
  pipelineContext: any,
  postprocessors: Postprocessor[] = DEFAULT_POSTPROCESSORS,
): ParsedRaidData {
  const startTime = Date.now();

  // Initialize context
  const initialContext: PostprocessorContext = {
    originalMessage,
    pipelineContext,
    aiResponse,
    parsedData: {},
    finalResult: null,
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

  if (!finalContext.finalResult) {
    throw new Error("Failed to process AI response");
  }

  return finalContext.finalResult;
}

/**
 * Processes validation response through a simple pipeline
 */
export function processValidationResponse(
  validationResponse: unknown,
  context: any, // PreprocessorContext from pipeline
): boolean {
  if (typeof validationResponse === "string") {
    const normalizedResponse = validationResponse.toLowerCase().trim();
    return normalizedResponse === "true";
  }

  if (typeof validationResponse === "boolean") {
    return validationResponse;
  }

  // If validation fails, assume it's not a raid message
  return false;
}
