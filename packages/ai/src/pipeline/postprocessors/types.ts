import { ParsedRaidData } from "../../types";
import { PreprocessorContext } from "../preprocessors";

export interface PostprocessorContext {
  originalMessage: string;
  preprocessedContext: PreprocessorContext;
  aiResponse: unknown;
  aiData: Record<string, unknown>;
  data: ParsedRaidData | null;
  metadata: {
    processingTime: number;
    validationErrors: string[];
    confidence: number;
  };
}

export type Postprocessor = (context: PostprocessorContext) => PostprocessorContext;

export const DEFAULT_POSTPROCESSORS: Postprocessor[] = [];
