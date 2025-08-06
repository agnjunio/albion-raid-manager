import { ContentType } from "@albion-raid-manager/core/types";
import { beforeEach, describe, expect, it } from "vitest";

import { PreprocessorContext } from "../preprocessors";

import { locationRequirementsPostprocessor, type PostprocessorContext } from "./index";

describe("Location Requirements Postprocessor", () => {
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

  it("should handle AI-provided confidence", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        confidence: 0.85,
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.confidence).toBe(0.85);
  });

  it("should clamp confidence to 0-1 range", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        confidence: 1.5, // Above 1
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.confidence).toBe(1);
  });

  it("should use default confidence when not provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.confidence).toBe(0.5);
  });

  it("should use AI-provided location", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        location: "Fort Sterling",
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.location).toBe("Fort Sterling");
  });

  it("should use default location when not provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    // This test assumes getDefaultLocation returns a value for GROUP_DUNGEON
    expect(result.aiData.location).toBeDefined();
  });

  it("should use AI-provided requirements", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: {
        requirements: ["T6 Gear", "800 IP minimum"],
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.requirements).toEqual(["T6 Gear", "800 IP minimum"]);
  });

  it("should use extracted requirements when AI requirements not provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext: {
        ...preprocessedContext,
        extractedRequirements: ["T7 Gear", "1000 IP minimum"],
      },
      aiResponse: {},
      aiData: {
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.requirements).toEqual(["T7 Gear", "1000 IP minimum"]);
  });

  it("should default to empty requirements when none are available", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext: {
        ...preprocessedContext,
        extractedRequirements: [], // Empty array
      },
      aiResponse: {},
      aiData: {
        contentType: "GROUP_DUNGEON" as ContentType,
      },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = locationRequirementsPostprocessor(initialContext);

    expect(result.aiData.requirements).toEqual([]);
  });
});
