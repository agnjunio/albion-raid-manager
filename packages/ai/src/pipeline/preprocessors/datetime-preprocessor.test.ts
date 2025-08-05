import { describe, expect, it } from "vitest";

import { timePreprocessor } from "./datetime-preprocessor";

import { type PreprocessorContext } from "./index";

describe("Time Preprocessor Pipeline", () => {
  it("should extract time and update context correctly", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Raid at 16:30 today",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = timePreprocessor(initialContext);

    // Should extract time
    expect(result.extractedTime).toBe("16:30");

    // Should preserve other fields
    expect(result.processedMessage).toBe("processed");
    expect(result.extractedSlots).toEqual([]);
    expect(result.preAssignedRoles).toEqual([]);
  });

  it("should handle 12-hour format", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Raid at 8:30 PM",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = timePreprocessor(initialContext);

    expect(result.extractedTime).toBe("8:30");
  });

  it("should handle just hours format", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Raid at 20h",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = timePreprocessor(initialContext);

    expect(result.extractedTime).toBeNull();
  });

  it("should handle message without time", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Just a regular raid message",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 30,
        processedLength: 25,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = timePreprocessor(initialContext);

    expect(result.extractedTime).toBeNull();
  });

  it("should handle empty message", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "",
      processedMessage: "processed",
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
    };

    const result = timePreprocessor(initialContext);

    expect(result.extractedTime).toBeNull();
  });

  it("should preserve existing extracted time", () => {
    const initialContext: PreprocessorContext = {
      originalMessage: "Raid at 16:30",
      processedMessage: "processed",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: "14:00", // Already extracted
      preAssignedContentType: null,
      metadata: {
        originalLength: 20,
        processedLength: 15,
        tokenReduction: 5,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = timePreprocessor(initialContext);

    // Should extract new time from message
    expect(result.extractedTime).toBe("16:30");
  });
});
