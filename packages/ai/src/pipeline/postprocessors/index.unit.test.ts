import { ContentType } from "@albion-raid-manager/types";
import { beforeEach, describe, expect, it } from "vitest";

import { AiRaid } from "../../types";
import { PreprocessorContext } from "../preprocessors";

import { Postprocessor, processAIResponse, processValidationResponse } from "./index";

describe("Process AI Response", () => {
  let aiData: AiRaid;
  let originalMessage: string;
  let preprocessedContext: PreprocessorContext;

  beforeEach(() => {
    aiData = {
      title: "Avalonian Dungeon Run",
      contentType: "ROADS_OF_AVALON_PVE" as ContentType,
      timestamp: "2023-06-15",
      location: "Martlock",
      requirements: [],
      roles: [],
    };

    originalMessage = "Let's do an Avalonian Dungeon at 14:30";

    preprocessedContext = {
      originalMessage: "Let's do an Avalonian Dungeon at 14:30",
      processedMessage: "Let's do an Avalonian Dungeon at 14:30",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: "14:30",
      preAssignedContentType: {
        type: "ROADS_OF_AVALON_PVE" as ContentType,
        confidence: 0.8,
        partySize: {
          min: 7,
          max: 7,
        },
        raidType: "FIXED",
      },
      metadata: {
        originalLength: 0,
        processedLength: 0,
        tokenReduction: 0,
        slotCount: 0,
        requirementCount: 0,
      },
    };
  });

  it("should process AI response through the postprocessor pipeline", () => {
    const result = processAIResponse(aiData, originalMessage, preprocessedContext);

    // We don't need to check every field exactly since the implementation might change
    // Just check a few key fields to ensure the pipeline is working
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("date");
    expect(result).toHaveProperty("contentType", "ROADS_OF_AVALON_PVE");
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getHours()).toBe(14);
    expect(result.date.getMinutes()).toBe(30);
  });

  it("should throw error when processing fails", () => {
    const customPostprocessor: Postprocessor = () => {
      return null;
    };

    expect(() => {
      processAIResponse(aiData, "Test message", preprocessedContext, [customPostprocessor]);
    }).toThrow("Failed to process AI response");
  });
});

describe("Process Validation Response", () => {
  it("should handle string 'true' as true", () => {
    const result = processValidationResponse("true");
    expect(result).toBe(true);
  });

  it("should handle string 'True' with different casing as true", () => {
    const result = processValidationResponse("True");
    expect(result).toBe(true);
  });

  it("should handle string 'false' as false", () => {
    const result = processValidationResponse("false");
    expect(result).toBe(false);
  });

  it("should handle boolean true as true", () => {
    const result = processValidationResponse(true);
    expect(result).toBe(true);
  });

  it("should handle boolean false as false", () => {
    const result = processValidationResponse(false);
    expect(result).toBe(false);
  });

  it("should handle non-boolean/string values as false", () => {
    const result = processValidationResponse({ isValid: true });
    expect(result).toBe(false);
  });

  it("should handle null as false", () => {
    const result = processValidationResponse(null);
    expect(result).toBe(false);
  });
});
