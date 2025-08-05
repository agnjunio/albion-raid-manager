import { describe, expect, it } from "vitest";

import { createPreprocessor, type PreprocessorContext } from "./index";

describe("Base Preprocessor", () => {
  it("should create a preprocessor that merges context correctly", () => {
    const customPreprocessor = createPreprocessor((context) => ({
      processedMessage: "custom message",
      metadata: {
        ...context.metadata,
        tokenReduction: 10,
      },
    }));

    const initialContext: PreprocessorContext = {
      originalMessage: "test message",
      processedMessage: "original",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 12,
        processedLength: 8,
        tokenReduction: 4,
        slotCount: 0,
        requirementCount: 0,
      },
    };

    const result = customPreprocessor(initialContext);

    expect(result.processedMessage).toBe("custom message");
    expect(result.metadata.tokenReduction).toBe(10);
    expect(result.originalMessage).toBe("test message"); // Should be preserved
    expect(result.extractedSlots).toEqual([]); // Should be preserved
  });

  it("should handle empty processor function", () => {
    const emptyPreprocessor = createPreprocessor(() => ({}));

    const initialContext: PreprocessorContext = {
      originalMessage: "test",
      processedMessage: "original",
      extractedSlots: ["slot1"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 4,
        processedLength: 8,
        tokenReduction: -4,
        slotCount: 1,
        requirementCount: 0,
      },
    };

    const result = emptyPreprocessor(initialContext);

    // Should return the original context unchanged
    expect(result).toEqual(initialContext);
  });

  it("should handle partial context updates", () => {
    const partialPreprocessor = createPreprocessor((context) => ({
      extractedSlots: [...context.extractedSlots, "new slot"],
      metadata: {
        ...context.metadata,
        slotCount: context.metadata.slotCount + 1,
      },
    }));

    const initialContext: PreprocessorContext = {
      originalMessage: "test",
      processedMessage: "original",
      extractedSlots: ["existing slot"],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: null,
      preAssignedContentType: null,
      metadata: {
        originalLength: 4,
        processedLength: 8,
        tokenReduction: -4,
        slotCount: 1,
        requirementCount: 0,
      },
    };

    const result = partialPreprocessor(initialContext);

    expect(result.extractedSlots).toEqual(["existing slot", "new slot"]);
    expect(result.metadata.slotCount).toBe(2);
    expect(result.processedMessage).toBe("original"); // Should be preserved
  });
});
