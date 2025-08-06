import { beforeEach, describe, expect, it } from "vitest";

import { contentTypePostprocessor } from "./content-type-postprocessor";
import { type PostprocessorContext } from "./types";

describe("Content Type Postprocessor", () => {
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

  it("should use AI content type when provided", () => {
    initialContext.aiData.contentType = "GROUP_DUNGEON";

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("GROUP_DUNGEON");
  });

  it("should normalize AI content type", () => {
    initialContext.aiData.contentType = "group dungeon";

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("GROUP_DUNGEON");
  });

  it("should fallback to preprocessed content type when AI content type not provided", () => {
    initialContext.aiData.contentType = undefined;

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("OTHER");
  });

  it("should fallback to preprocessed content type when AI content type not provided", () => {
    initialContext.aiData.contentType = undefined;

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("OTHER");
  });

  it("should handle invalid content type", () => {
    initialContext.aiData.contentType = "INVALID_TYPE";

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("GROUP_DUNGEON");
  });

  it("should default to OTHER when no content type is available", () => {
    initialContext.aiData.contentType = undefined;

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("OTHER");
  });

  it("should handle invalid content type", () => {
    initialContext.aiData.contentType = "INVALID_TYPE";

    const result = contentTypePostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.contentType).toBe("GROUP_DUNGEON");
  });
});
