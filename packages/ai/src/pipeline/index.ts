import { type Preprocessor, type PreprocessorContext } from "./preprocessors";
import { contentTypePreprocessor } from "./preprocessors/content-type-preprocessor";
import { parseTimeString, timePreprocessor } from "./preprocessors/datetime-preprocessor";
import { messagePreprocessor } from "./preprocessors/message-preprocessor";
import { rolePreprocessor } from "./preprocessors/role-preassigner";
import { requirementPreprocessor, slotPreprocessor } from "./preprocessors/slot-preprocessor";
import { detectContentType, getDefaultLocation, normalizeContentType } from "./utils";

// Re-export types for external use
export type { Preprocessor, PreprocessorContext };

// Default pipeline with all preprocessors enabled
const PREPROCESSORS: Preprocessor[] = [
  messagePreprocessor,
  slotPreprocessor,
  rolePreprocessor,
  requirementPreprocessor,
  timePreprocessor,
  contentTypePreprocessor,
];

/**
 * Processes a message through the preprocessor pipeline
 */
export function processMessage(message: string): PreprocessorContext {
  // Initialize context
  const initialContext: PreprocessorContext = {
    originalMessage: message,
    processedMessage: message,
    extractedSlots: [],
    preAssignedRoles: [],
    extractedRequirements: [],
    extractedTime: null,
    preAssignedContentType: null,
    metadata: {
      originalLength: message.length,
      processedLength: message.length,
      tokenReduction: 0,
      slotCount: 0,
      requirementCount: 0,
    },
  };

  // Run through all preprocessors
  return PREPROCESSORS.reduce((context, preprocessor) => {
    return preprocessor(context);
  }, initialContext);
}

// Export utility functions for backward compatibility
export { detectContentType, getDefaultLocation, normalizeContentType, parseTimeString };

// Re-export response processing methods from postprocessors
export { processAIResponse, processValidationResponse } from "./postprocessors";
