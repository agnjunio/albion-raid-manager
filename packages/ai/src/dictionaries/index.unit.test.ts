import { describe, expect, it } from "vitest";

import { detectLanguages, SUPPORTED_LANGUAGES } from "./index";

describe("Language Detection", () => {
  it("should return a sorted array of language scores", () => {
    const text = "Looking for tank and healer for dungeon raid at 8pm";
    const result = detectLanguages(text);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].language).toBe("en");
    expect(result[0].score).toBeGreaterThan(0);
    // Confidence should be a positive number
    expect(result[0].confidence).toBeGreaterThanOrEqual(0);
  });

  it("should return multiple languages for mixed content", () => {
    // Mix of English and Portuguese
    const text = "Looking for tank e healer para raid no dungeon at 8pm, gear score 1200+";
    const result = detectLanguages(text);

    expect(result.length).toBeGreaterThan(1);
    // Both English and Portuguese should be detected
    const languages = result.map((item) => item.language);
    expect(languages).toContain("en");
    expect(languages).toContain("pt");
  });

  it("should return an empty array for text with no significant matches", () => {
    const result = detectLanguages("123456789");
    expect(result.length).toBe(0);
  });

  it("should give higher scores to longer pattern matches", () => {
    // "raid leader" is a longer pattern than just "raid"
    const text1 = "Looking for raid leader";
    const text2 = "Looking for raid";

    const result1 = detectLanguages(text1);
    const result2 = detectLanguages(text2);

    expect(result1[0].score).toBeGreaterThan(result2[0].score);
  });

  it("should give higher scores to whole word matches than partial matches", () => {
    // "tank" as a whole word vs "tank" as part of another word
    const text1 = "Need a tank for raid";
    const text2 = "Need a tanker for raid"; // "tank" is part of "tanker"

    const result1 = detectLanguages(text1);
    const result2 = detectLanguages(text2);

    // Filter to just English results
    const enScore1 = result1.find((r) => r.language === "en")?.score || 0;
    const enScore2 = result2.find((r) => r.language === "en")?.score || 0;

    // The whole word match should have a higher score
    expect(enScore1).toBeGreaterThan(enScore2);
  });

  it("should handle all supported languages", () => {
    // Test data with sample text for each supported language
    const languageSamples: Record<string, string> = {
      en: "tank healer dps raid dungeon",
      pt: "tanque curandeiro dps raid masmorra",
      es: "tanque sanador dps raid mazmorra",
      ru: "танк хилер дпс рейд подземелье",
      zh: "坦克 治疗 输出 团队 副本",
      fr: "tank soigneur dps raid donjon",
      de: "panzer heiler dps raid verlies",
      ja: "タンク ヒーラー DPS レイド ダンジョン",
      ko: "탱커 힐러 딜러 레이드 던전",
    };

    // Test each language
    SUPPORTED_LANGUAGES.forEach((language) => {
      if (languageSamples[language]) {
        const result = detectLanguages(languageSamples[language]);

        // The target language should be detected and should be the top result
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].language).toBe(language);
      }
    });
  });

  it("should calculate confidence based on pattern ratio and score", () => {
    // Text with many English patterns
    const text1 = "Looking for tank healer dps support for dungeon raid with guild group";
    // Text with fewer English patterns
    const text2 = "Tank and healer";

    const result1 = detectLanguages(text1);
    const result2 = detectLanguages(text2);

    // First text should have higher confidence for English
    const confidence1 = result1.find((r) => r.language === "en")?.confidence || 0;
    const confidence2 = result2.find((r) => r.language === "en")?.confidence || 0;

    expect(confidence1).toBeGreaterThan(confidence2);
  });
});
