/**
 * Centralized Albion Online item validation
 * Supports current Albion item ID format:
 * - Current format: [TIER]_[PREFIX]_[ITEM_NAME]@[ENCHANTMENT]
 * - Examples: 16_ZH_HOLYSTAFF@U, 18_ZH_MACE@I, 17_ZH_FIKE_KINGPAIK_AVALON@Z
 */

export interface ItemValidationResult {
  isValid: boolean;
  error?: string;
  tier?: number;
  enchantment?: number;
  itemName?: string;
}

/**
 * Validates an Albion Online item pattern
 */
export function validateItemPattern(item: string): ItemValidationResult {
  if (!item || item.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const trimmed = item.trim();

  // Current format [TIER]_[PREFIX]_[ITEM_NAME]@[ENCHANTMENT]
  // Examples: 16_ZH_HOLYSTAFF@U, 18_ZH_MACE@I, 17_ZH_FIKE_KINGPAIK_AVALON@Z
  const currentPattern = /^(\d+)_([A-Z0-9_]+)@([A-Z])$/;
  const currentMatch = trimmed.match(currentPattern);

  if (currentMatch) {
    const [, tierStr, itemName, enchantmentStr] = currentMatch;
    const tier = parseInt(tierStr, 10);

    if (tier < 1 || tier > 20) {
      return {
        isValid: false,
        error: "Tier must be between 1 and 20",
      };
    }

    if (itemName.length < 3) {
      return {
        isValid: false,
        error: "Item name must be at least 3 characters",
      };
    }

    // Map enchantment letters to numbers
    const enchantmentMap: Record<string, number> = {
      "0": 0,
      "1": 1,
      "2": 2,
      "3": 3,
      U: 0,
      I: 1,
      II: 2,
      III: 3,
      Z: 0,
      A: 1,
      B: 2,
      C: 3,
    };

    const enchantment = enchantmentMap[enchantmentStr] ?? 0;

    return {
      isValid: true,
      tier,
      enchantment,
      itemName,
    };
  }

  // If no pattern matches, but it looks like a reasonable item ID, allow it
  // This handles edge cases and future format changes
  if (trimmed.length > 3 && /^[A-Z0-9_@]+$/.test(trimmed)) {
    return {
      isValid: true,
      itemName: trimmed,
    };
  }

  return {
    isValid: false,
    error: "Invalid item format. Expected format: [TIER]_[PREFIX]_[ITEM_NAME]@[ENCHANTMENT] (e.g., 16_ZH_HOLYSTAFF@U)",
  };
}

/**
 * Simple boolean validation for Zod schemas
 */
export function validateItemPatternBoolean(item: string): boolean {
  return validateItemPattern(item).isValid;
}

/**
 * Common weapon examples for help text
 */
export const WEAPON_EXAMPLES = [
  "16_ZH_HOLYSTAFF@U",
  "18_ZH_MACE@I",
  "17_ZH_FIKE_KINGPAIK_AVALON@Z",
  "15_ZH_MAIN_SWORD@U",
  "14_ZH_2H_CROSSBOW@C",
] as const;
