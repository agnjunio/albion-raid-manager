import { describe, expect, it } from "vitest";

import { average, digitsFormatter, humanFormatter } from "./math";

describe("Math utilities", () => {
  describe("average", () => {
    it("should calculate average of positive numbers", () => {
      expect(average(1, 2, 3, 4, 5)).toBe(3);
    });

    it("should calculate average of negative numbers", () => {
      expect(average(-1, -2, -3, -4, -5)).toBe(-3);
    });

    it("should calculate average of mixed numbers", () => {
      expect(average(-2, 0, 2)).toBe(0);
    });

    it("should handle single number", () => {
      expect(average(42)).toBe(42);
    });

    it("should handle empty array", () => {
      expect(average()).toBeNaN();
    });

    it("should round to nearest integer", () => {
      expect(average(1, 2)).toBe(2); // 1.5 rounds to 2
      expect(average(1, 3)).toBe(2); // 2 rounds to 2
      expect(average(1, 4)).toBe(3); // 2.5 rounds to 3
    });
  });

  describe("digitsFormatter", () => {
    it("should format numbers with thousands separators", () => {
      expect(digitsFormatter(1000)).toBe("1.000");
      expect(digitsFormatter(10000)).toBe("10.000");
      expect(digitsFormatter(100000)).toBe("100.000");
      expect(digitsFormatter(1000000)).toBe("1.000.000");
    });

    it("should handle numbers without thousands separators", () => {
      expect(digitsFormatter(100)).toBe("100");
      expect(digitsFormatter(99)).toBe("99");
      expect(digitsFormatter(1)).toBe("1");
    });

    it("should handle zero", () => {
      expect(digitsFormatter(0)).toBe(0);
    });

    it("should handle undefined", () => {
      expect(digitsFormatter(undefined)).toBe(0);
    });

    it("should handle null", () => {
      expect(digitsFormatter(null as any)).toBe(0);
    });

    it("should handle negative numbers", () => {
      expect(digitsFormatter(-1000)).toBe("-1.000");
      expect(digitsFormatter(-1000000)).toBe("-1.000.000");
    });
  });

  describe("humanFormatter", () => {
    it("should format numbers with appropriate suffixes", () => {
      expect(humanFormatter(1000, 1)).toBe("1k");
      expect(humanFormatter(1000000, 1)).toBe("1m");
      expect(humanFormatter(1000000000, 1)).toBe("1b");
      expect(humanFormatter(1000000000000, 1)).toBe("1t");
    });

    it("should handle numbers without suffixes", () => {
      expect(humanFormatter(100, 1)).toBe("100");
      expect(humanFormatter(50, 1)).toBe("50");
      expect(humanFormatter(1, 1)).toBe("1");
    });

    it("should respect decimal places", () => {
      expect(humanFormatter(1234, 0)).toBe("1k");
      expect(humanFormatter(1234, 1)).toBe("1.2k");
      expect(humanFormatter(1234, 2)).toBe("1.23k");
      expect(humanFormatter(1234, 3)).toBe("1.234k");
    });

    it("should handle zero", () => {
      expect(humanFormatter(0, 1)).toBe("0");
    });

    it("should handle negative numbers", () => {
      expect(humanFormatter(-1000, 1)).toBe("-1000");
      expect(humanFormatter(-1000000, 1)).toBe("-1000000");
    });

    it("should handle very large numbers", () => {
      expect(humanFormatter(1e15, 1)).toBe("1q");
      expect(humanFormatter(1e18, 1)).toBe("1Q");
    });

    it("should remove trailing zeros", () => {
      expect(humanFormatter(1000, 2)).toBe("1k");
      expect(humanFormatter(1000, 3)).toBe("1k");
      expect(humanFormatter(1200, 2)).toBe("1.2k");
    });

    it("should handle edge cases", () => {
      expect(humanFormatter(999, 1)).toBe("999");
      expect(humanFormatter(1001, 1)).toBe("1k");
      expect(humanFormatter(999999, 1)).toBe("1000k");
    });
  });
});
