import { ContentType, RaidType } from "@albion-raid-manager/core/types";

export interface PreAssignedRole {
  name: string;
  role: string; // The role enum value (TANK, HEALER, SUPPORT, etc.)
  confidence: number; // 0-1, how confident we are in this assignment
}

export interface PreprocessorContext {
  originalMessage: string;
  processedMessage: string;
  extractedSlots: string[];
  preAssignedRoles: PreAssignedRole[];
  extractedRequirements: string[];
  extractedTime: string | null;
  preAssignedContentType: {
    type: ContentType;
    confidence: number;
    partySize: { min: number; max: number };
    raidType: RaidType;
  } | null;
  metadata: {
    originalLength: number;
    processedLength: number;
    tokenReduction: number;
    slotCount: number;
    requirementCount: number;
  };
}

export type Preprocessor = (context: PreprocessorContext) => PreprocessorContext;

/**
 * Base preprocessor function that handles common patterns
 */
export function createPreprocessor(
  processor: (context: PreprocessorContext) => Partial<PreprocessorContext>,
): Preprocessor {
  return (context: PreprocessorContext) => ({
    ...context,
    ...processor(context),
  });
}
