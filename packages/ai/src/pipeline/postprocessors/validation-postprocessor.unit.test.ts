import { beforeEach, describe, expect, it } from "vitest";

import { PreprocessorContext } from "../preprocessors";

import { validationPostprocessor, type PostprocessorContext } from "./index";

describe("Validation Postprocessor", () => {
  let preprocessedContext: PreprocessorContext;

  beforeEach(() => {
    preprocessedContext = {
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
    };
  });

  it("should handle valid object response", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: { title: "Test Raid", date: "2023-06-15" },
      aiData: {},
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = validationPostprocessor(initialContext);

    expect(result.aiData).toEqual({ title: "Test Raid", date: "2023-06-15" });
    expect(result.metadata.validationErrors).toEqual([]);
  });

  it("should handle null response", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: null,
      aiData: {},
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = validationPostprocessor(initialContext);

    expect(result.aiData).toEqual({});
    expect(result.metadata.validationErrors).toEqual(["Invalid data format"]);
  });

  it("should handle non-object response", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: "Not an object",
      aiData: {},
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = validationPostprocessor(initialContext);

    expect(result.aiData).toEqual({});
    expect(result.metadata.validationErrors).toEqual(["Invalid data format"]);
  });
});
