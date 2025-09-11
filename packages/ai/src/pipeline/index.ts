import { getDefaultLocation, normalizeContentType } from "@albion-raid-manager/core/entities";

import { type Preprocessor, type PreprocessorContext } from "./preprocessors";
import { contentTypePreprocessor, detectContentType } from "./preprocessors/content-type-preprocessor";
import { parseTimeString, timePreprocessor } from "./preprocessors/datetime-preprocessor";
import { messagePreprocessor } from "./preprocessors/message-preprocessor";
import { rolePreprocessor } from "./preprocessors/role-preprocessor";
import { requirementPreprocessor, slotPreprocessor } from "./preprocessors/slot-preprocessor";

export type { PreprocessorContext };

const PREPROCESSORS: Preprocessor[] = [
  messagePreprocessor,
  slotPreprocessor,
  rolePreprocessor,
  requirementPreprocessor,
  timePreprocessor,
  contentTypePreprocessor,
];

export function preprocessMessage(message: string): PreprocessorContext {
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

  return PREPROCESSORS.reduce((context, preprocessor) => {
    return preprocessor(context);
  }, initialContext);
}

export { detectContentType, getDefaultLocation, normalizeContentType, parseTimeString };

export { processAIResponse, processValidationResponse } from "./postprocessors";
