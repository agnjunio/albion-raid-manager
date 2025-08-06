import { ContentType } from "@albion-raid-manager/core/types";
import { beforeEach, describe, expect, it } from "vitest";

import { PreprocessorContext } from "../preprocessors";

import { processAIResponse, processValidationResponse, type PostprocessorContext } from "./index";

describe("Process AI Response", () => {
  let preprocessedContext: PreprocessorContext;

  beforeEach(() => {
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
    const aiResponse = {
      title: "Avalonian Dungeon Run",
      description: "T8 Avalonian Dungeon",
      date: "2023-06-15",
      time: "14:30",
      location: "Martlock",
      requirements: ["T7 Gear", "1000 IP minimum"],
      roles: [
        {
          name: "Tank",
          role: "TANK",
          count: 1,
        },
        {
          name: "Healer",
          role: "HEALER",
          count: 1,
        },
      ],
      maxParticipants: 7,
      notes: "Bring food and potions",
      confidence: 0.85,
      contentType: "ROADS_OF_AVALON_PVE",
      contentTypeConfidence: 0.9,
    };

    const originalMessage = "Let's do an Avalonian Dungeon at 14:30";

    const result = processAIResponse(aiResponse, originalMessage, preprocessedContext);

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
    // Create a custom postprocessor pipeline that doesn't set finalResult
    const customPostprocessor = (context: PostprocessorContext): PostprocessorContext => {
      return {
        ...context,
        data: null, // Explicitly set to null to ensure test fails
      };
    };

    const aiResponse = {
      title: "Test Raid",
      contentType: "GROUP_DUNGEON" as ContentType,
    };

    expect(() => {
      processAIResponse(aiResponse, "Test message", preprocessedContext, [customPostprocessor]);
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
