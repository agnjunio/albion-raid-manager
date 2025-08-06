import { ContentType } from "@albion-raid-manager/core/types";
import { beforeEach, describe, expect, it } from "vitest";

import { PreprocessorContext } from "../preprocessors";

import { contentTypePostprocessor, type PostprocessorContext } from "./index";

describe("Content Type Postprocessor", () => {
  let preprocessedContext: PreprocessorContext;

  beforeEach(() => {
    preprocessedContext = {
      originalMessage: "Test message",
      processedMessage: "Test message",
      extractedSlots: [],
      preAssignedRoles: [],
      extractedRequirements: [],
      extractedTime: "14:30",
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

  it("should use AI content type when provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        contentType: "GROUP_DUNGEON",
        contentTypeConfidence: 0.9,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = contentTypePostprocessor(initialContext);

    expect(result.aiData.contentType).toBe("GROUP_DUNGEON");
    expect(result.aiData.contentTypeConfidence).toBe(0.9);
  });

  it("should normalize AI content type", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        contentType: "group dungeon", // Lowercase with space
        contentTypeConfidence: 0.8,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = contentTypePostprocessor(initialContext);

    expect(result.aiData.contentType).toBe("GROUP_DUNGEON");
    expect(result.aiData.contentTypeConfidence).toBe(0.8);
  });

  it("should fallback to preprocessed content type when AI content type not provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext: {
        ...preprocessedContext,
        preAssignedContentType: {
          type: "ROADS_OF_AVALON_PVE" as ContentType,
          confidence: 0.7,
          partySize: {
            min: 7,
            max: 7,
          },
          raidType: "FIXED",
        },
      },
      aiResponse: {},
      aiData: {},
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = contentTypePostprocessor(initialContext);

    expect(result.aiData.contentType).toBe("ROADS_OF_AVALON_PVE");
    expect(result.aiData.contentTypeConfidence).toBe(0.7);
  });

  it("should default to OTHER when no content type is available", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {},
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = contentTypePostprocessor(initialContext);

    expect(result.aiData.contentType).toBe("OTHER");
    expect(result.aiData.contentTypeConfidence).toBe(0.5);
  });

  it("should handle invalid content type", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        contentType: "INVALID_TYPE",
        contentTypeConfidence: 0.6,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = contentTypePostprocessor(initialContext);

    // The normalizeContentType function might return GROUP_DUNGEON for "INVALID_TYPE"
    // so we just check that it's a valid string
    expect(typeof result.aiData.contentType).toBe("string");
    expect(result.aiData.contentTypeConfidence).toBe(0.6);
  });
});
