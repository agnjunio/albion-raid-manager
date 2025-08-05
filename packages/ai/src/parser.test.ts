import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseDiscordMessage, resetAIService } from "./parser";
import { detectContentType } from "./pipeline/preprocessors/content-type-preprocessor";
import { extractTimeFromMessage } from "./pipeline/preprocessors/datetime-preprocessor";
import { extractRequirements } from "./pipeline/preprocessors/slot-preprocessor";

// Mock the AI service
vi.mock("./service/factory", () => ({
  getAIService: () => ({
    provider: "anthropic",
    validateMessage: vi.fn().mockResolvedValue(true),
    parseDiscordPing: vi.fn().mockResolvedValue({
      title: "Raid",
      date: new Date("2024-01-15T20:30:00Z"),
      location: "Brecilien",
      requirements: ["T8", "1 food boa e 2 ruins", "Lobo +"],
      roles: [
        { name: "Martelo", role: "MELEE_DPS", preAssignedUser: "310246271627558922" },
        { name: "Monarca Tempestuoso", role: "MELEE_DPS", preAssignedUser: "412378297012584451" },
        { name: "Queda Santa", role: "HEALER", preAssignedUser: "155377266568855552" },
        { name: "Astral", role: "RANGED_DPS", preAssignedUser: "309455420605464576" },
        { name: "Águia", role: "RANGED_DPS", preAssignedUser: "727970289518116995" },
        { name: "Machadão/Putrido", role: "RANGED_DPS", preAssignedUser: "511924112248274944" },
        { name: "Garceira", role: "MELEE_DPS", preAssignedUser: "422533251974823948" },
      ],
      confidence: 0.9,
      contentType: "ROADS_OF_AVALON_PVE",
      contentTypeConfidence: 0.9,
    }),
  }),
}));

describe("AI Parser Improvements", () => {
  beforeEach(() => {
    resetAIService();
  });

  const testMessage = `Roaming as 20:30
Build T8
1 food boa e 2 ruins
Montaria: Lobo +

@everyone 

👑 Martelo: <@310246271627558922> 
<:mace:1400453961093349497> Monarca Tempestuoso: <@412378297012584451> 
<:holy:1400455990142304377> Queda Santa: <@155377266568855552> 
<:astral:1400455301240721438> Astral: <@309455420605464576> 
<:phoenix:1400458229032554506> Águia: <@727970289518116995> 
<:axe:1400453795049246720> <:rotcaller:1400455488960991373>  Machadão/Putrido: <@511924112248274944> 
<:spear:1400456669267230801> Garceira: <@422533251974823948>`;

  describe("Content Type Detection", () => {
    it("should detect ROADS_OF_AVALON_PVE for 7 players", () => {
      const result = detectContentType(testMessage);
      expect(result.type).toBe("ROADS_OF_AVALON_PVP");
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe("Requirement Extraction", () => {
    it("should extract all requirements correctly", () => {
      const requirements = extractRequirements(testMessage);
      expect(requirements).toContain("T8");
      expect(requirements).toContain("1 food boa e 2 ruins");
      expect(requirements).toContain("Lobo +");
    });

    it("should handle mount requirements correctly", () => {
      const requirements = extractRequirements("Montaria: Lobo +");
      expect(requirements).toContain("Lobo +");
    });
  });

  describe("Time Extraction", () => {
    it("should extract time from message", () => {
      const time = extractTimeFromMessage(testMessage);
      expect(time).toBe("20:30");
    });
  });

  describe("Full Message Parsing", () => {
    it("should parse the complete message correctly", async () => {
      const result = await parseDiscordMessage(testMessage);

      expect(result.contentType).toBe("ROADS_OF_AVALON_PVE");
      expect(result.location).toBe("Brecilien");
      expect(result.requirements).toContain("T8");
      expect(result.requirements).toContain("1 food boa e 2 ruins");
      expect(result.requirements).toContain("Lobo +");
      expect(result.roles).toHaveLength(7);

      // Check that preassigned users are included
      const marteloRole = result.roles?.find((r) => r.name === "Martelo");
      expect(marteloRole?.preAssignedUser).toBe("310246271627558922");

      const quedaRole = result.roles?.find((r) => r.name === "Queda Santa");
      expect(quedaRole?.preAssignedUser).toBe("155377266568855552");
    });
  });
});
