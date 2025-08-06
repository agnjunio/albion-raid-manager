import { beforeEach, describe, expect, it } from "vitest";

import { dateTimePostprocessor } from "./datetime-postprocessor";
import { type PostprocessorContext } from "./types";

describe("DateTime Postprocessor", () => {
  let initialContext: PostprocessorContext;

  beforeEach(() => {
    initialContext = {
      originalMessage: "Test message",
      preprocessedContext: {
        originalMessage: "Test message",
        processedMessage: "Test message",
        extractedSlots: [],
        preAssignedRoles: [],
        extractedRequirements: [],
        extractedTime: null,
        preAssignedContentType: null,
        metadata: {
          originalLength: 0,
          processedLength: 0,
          tokenReduction: 0,
          slotCount: 0,
          requirementCount: 0,
        },
      },
      aiData: {
        title: "Test Raid",
        contentType: "GROUP_DUNGEON",
        timestamp: "2025-08-06T20:30:00.000Z",
        location: "Fort Sterling",
        requirements: ["T8 Gear"],
        roles: [],
        confidence: 0.85,
      },
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
  });

  it("should handle ISO timestamp format", () => {
    initialContext.aiData.timestamp = "2025-08-06T20:30:00.000Z";

    const result = dateTimePostprocessor(initialContext);

    expect(result).not.toBeNull();
    const resultDate = result!.parsedData.date as Date;
    expect(resultDate.getFullYear()).toBe(2025);
    expect(resultDate.getMonth()).toBe(7);
    expect(resultDate.getDate()).toBe(6);
    expect(resultDate.getHours()).toBe(20);
    expect(resultDate.getMinutes()).toBe(30);
  });

  it("should use extracted time from preprocessed context when AI time not provided", () => {
    initialContext.aiData.timestamp = undefined;
    initialContext.preprocessedContext.extractedTime = "15:45";

    const result = dateTimePostprocessor(initialContext);

    expect(result).not.toBeNull();
    const resultDate = result!.parsedData.date as Date;
    expect(resultDate.getHours()).toBe(15);
    expect(resultDate.getMinutes()).toBe(45);
  });

  it("should handle invalid date gracefully", () => {
    initialContext.aiData.timestamp = "invalid-date";

    const result = dateTimePostprocessor(initialContext);

    expect(result).not.toBeNull();
    const resultDate = result!.parsedData.date as Date;
    expect(resultDate.getHours()).toBe(0);
    expect(resultDate.getMinutes()).toBe(0);
  });

  it("should ignore 'Not specified' time", () => {
    initialContext.aiData.timestamp = "Not specified";

    const result = dateTimePostprocessor(initialContext);

    expect(result).not.toBeNull();
    const resultDate = result!.parsedData.date as Date;
    expect(resultDate.getHours()).toBe(0);
    expect(resultDate.getMinutes()).toBe(0);
  });
});
