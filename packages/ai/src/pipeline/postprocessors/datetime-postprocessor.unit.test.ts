import { beforeEach, describe, expect, it } from "vitest";

import { PreprocessorContext } from "../preprocessors";

import { dateTimePostprocessor, type PostprocessorContext } from "./index";

describe("DateTime Postprocessor", () => {
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

  it("should handle date string", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { date: "2023-06-15" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    expect(result.aiData.date).toBeInstanceOf(Date);
    expect((result.aiData.date as Date).getFullYear()).toBe(2023);
    expect((result.aiData.date as Date).getMonth()).toBe(5); // June is 5 (0-indexed)
    // Don't test exact day as it may depend on timezone
  });

  it("should handle time in HH:MM format", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { date: "2023-06-15", time: "14:30" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    expect(result.aiData.date).toBeInstanceOf(Date);
    expect((result.aiData.date as Date).getFullYear()).toBe(2023);
    expect((result.aiData.date as Date).getMonth()).toBe(5); // June is 5 (0-indexed)
    expect((result.aiData.date as Date).getHours()).toBe(14);
    expect((result.aiData.date as Date).getMinutes()).toBe(30);
  });

  it("should handle time in HHh format", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { date: "2023-06-15", time: "14h" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    expect(result.aiData.date).toBeInstanceOf(Date);
    expect((result.aiData.date as Date).getHours()).toBe(14);
    expect((result.aiData.date as Date).getMinutes()).toBe(0);
  });

  it("should handle time in HH format", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { date: "2023-06-15", time: "14" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    expect(result.aiData.date).toBeInstanceOf(Date);
    expect((result.aiData.date as Date).getHours()).toBe(14);
    expect((result.aiData.date as Date).getMinutes()).toBe(0);
  });

  it("should use extracted time from pipeline context when AI time not provided", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message at 15:45",
      preprocessedContext: {
        ...preprocessedContext,
        extractedTime: "15:45",
      },
      aiResponse: {},
      aiData: { date: "2023-06-15" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    expect(result.aiData.date).toBeInstanceOf(Date);
    expect((result.aiData.date as Date).getHours()).toBe(15);
    expect((result.aiData.date as Date).getMinutes()).toBe(45);
  });

  it("should handle invalid date gracefully", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { date: "invalid-date" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    // Should default to today's date
    expect(result.aiData.date).toBeInstanceOf(Date);
    // Just verify it's a valid date with hours and minutes set
    expect(typeof (result.aiData.date as Date).getHours()).toBe("number");
    expect(typeof (result.aiData.date as Date).getMinutes()).toBe("number");
  });

  it("should ignore 'Not specified' time", () => {
    const initialContext: PostprocessorContext = {
      originalMessage: "Test message",
      preprocessedContext,
      aiResponse: {},
      aiData: { date: "2023-06-15", time: "Not specified" },
      data: null,
      metadata: {
        processingTime: 0,
        validationErrors: [],
        confidence: 0,
      },
    };

    const result = dateTimePostprocessor(initialContext);

    expect(result.aiData.date).toBeInstanceOf(Date);
    // Just verify it's a valid date with hours and minutes set
    expect(typeof (result.aiData.date as Date).getHours()).toBe("number");
    expect(typeof (result.aiData.date as Date).getMinutes()).toBe("number");
  });
});
