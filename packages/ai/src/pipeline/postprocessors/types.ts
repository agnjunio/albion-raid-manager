import { AiRaid, ParsedRaidData } from "../../types";
import { PreprocessorContext } from "../preprocessors";

export interface PostprocessorContext {
  originalMessage: string;
  preprocessedContext: PreprocessorContext;
  aiData: AiRaid;
  parsedData: ParsedRaidData;
  metadata: {
    processingTime: number;
    validationErrors: string[];
    confidence: number;
  };
}

export type Postprocessor = (context: PostprocessorContext) => PostprocessorContext | null;
