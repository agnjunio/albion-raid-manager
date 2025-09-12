/**
 * Validates Albion Online weapon/item patterns
 * Pattern: T[1-8]_[ITEM_NAME]@[0-3]
 *
 * Examples:
 * - T6_2H_HOLYSTAFF@0 (Tier 6 Holy Staff, no enchantment)
 * - T8_2H_MACE@1 (Tier 8 Mace, enchantment 1)
 * - T7_2H_FIRE_RINGPAIR_AVALON@2 (Tier 7 Avalonian Fire Ring Pair, enchantment 2)
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
export function validateItemPattern(weapon: string): ItemValidationResult {
  if (!weapon || weapon.trim() === "") {
    return { isValid: true }; // Empty is valid (optional field)
  }

  const trimmed = weapon.trim();

  // Basic pattern validation: T[1-8]_[ITEM_NAME]@[0-3]
  const pattern = /^T([1-8])_([A-Z0-9_]+)@([0-3])$/;
  const match = trimmed.match(pattern);

  if (!match) {
    return {
      isValid: false,
      error: "Invalid weapon format. Use Albion pattern: T[1-8]_[ITEM_NAME]@[0-3] (e.g., T6_2H_HOLYSTAFF@0)",
    };
  }

  const [, tierStr, itemName, enchantmentStr] = match;
  const tier = parseInt(tierStr, 10);
  const enchantment = parseInt(enchantmentStr, 10);

  // Additional validation
  if (tier < 1 || tier > 8) {
    return {
      isValid: false,
      error: "Tier must be between 1 and 8",
    };
  }

  if (enchantment < 0 || enchantment > 3) {
    return {
      isValid: false,
      error: "Enchantment must be between 0 and 3",
    };
  }

  if (itemName.length < 3) {
    return {
      isValid: false,
      error: "Item name must be at least 3 characters",
    };
  }

  return {
    isValid: true,
    tier,
    enchantment,
    itemName,
  };
}

/**
 * Formats a weapon for display
 */
export function formatItemDisplay(weapon: string): string {
  const validation = validateItemPattern(weapon);

  if (!validation.isValid || !validation.tier || !validation.enchantment || !validation.itemName) {
    return weapon;
  }

  const { tier, enchantment, itemName } = validation;

  // Convert item name to readable format
  const readableName = itemName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Add enchantment suffix
  const enchantmentSuffix = enchantment > 0 ? ` (+${enchantment})` : "";

  return `T${tier} ${readableName}${enchantmentSuffix}`;
}

/**
 * Common weapon examples for help text
 */
export const WEAPON_EXAMPLES = [
  "T6_2H_HOLYSTAFF@0",
  "T8_2H_MACE@1",
  "T7_2H_FIRE_RINGPAIR_AVALON@2",
  "T5_MAIN_SWORD@0",
  "T4_2H_CROSSBOW@3",
] as const;
