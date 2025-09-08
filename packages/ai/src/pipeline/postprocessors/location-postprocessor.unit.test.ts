import { getLocation } from "@albion-raid-manager/core/entities";
import { ContentType } from "@albion-raid-manager/types";
import { beforeEach, describe, expect, it } from "vitest";

import { locationPostprocessor } from "./location-postprocessor";
import { type PostprocessorContext } from "./types";

describe("Location Postprocessor", () => {
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
        contentType: "GROUP_DUNGEON" as ContentType,
        timestamp: "2023-06-15",
        location: "Fort Sterling",
        requirements: ["T6 Gear", "800 IP minimum"],
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

  it("should use AI-provided location", () => {
    initialContext.aiData.location = "Fort Sterling";

    const result = locationPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBe("FORT_STERLING_CITY");
  });

  it("should normalize AI-provided location", () => {
    initialContext.aiData.location = "fortsterling"; // lowercase input

    const result = locationPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBe("FORT_STERLING_CITY"); // normalized key
  });

  it("should normalize portal locations", () => {
    initialContext.aiData.location = "martlock portal";

    const result = locationPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBe("MARTLOCK_PORTAL");
  });

  it("should normalize city locations", () => {
    initialContext.aiData.location = "caerleon";

    const result = locationPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBe("CAERLEON_CITY");
  });

  it("should allow retrieving location info from stored key", () => {
    initialContext.aiData.location = "martlock";

    const result = locationPostprocessor(initialContext);

    expect(result).not.toBeNull();
    const locationKey = result!.parsedData.location;
    expect(locationKey).toBe("MARTLOCK_CITY");

    // Verify we can retrieve the full location info from the key
    const locationInfo = getLocation(locationKey!);
    expect(locationInfo).not.toBeNull();
    expect(locationInfo!.name).toBe("Martlock");
    expect(locationInfo!.type).toBe("CITY");
    expect(locationInfo!.key).toBe("MARTLOCK_CITY");
  });

  it("should use default location when not provided", () => {
    initialContext.aiData.location = "";

    const result = locationPostprocessor(initialContext);

    expect(result).not.toBeNull();
    expect(result!.parsedData.location).toBeDefined();
  });
});
