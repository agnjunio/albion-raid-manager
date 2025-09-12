/**
 * Fuzzy search utilities for text matching with typo tolerance
 */

export interface FuzzySearchOptions {
  /** Maximum allowed edit distance (default: 2) */
  maxDistance?: number;
  /** Minimum length for fuzzy matching (default: 3) */
  minLength?: number;
  /** Whether to ignore case (default: true) */
  ignoreCase?: boolean;
  /** Whether to require exact prefix match (default: false) */
  requirePrefix?: boolean;
}

export interface FuzzyMatch {
  /** The matched text */
  text: string;
  /** Edit distance from the search term */
  distance: number;
  /** Match score (0-1, higher is better) */
  score: number;
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate fuzzy match score based on edit distance and text length
 */
export function calculateFuzzyScore(distance: number, textLength: number, searchLength: number): number {
  if (distance === 0) return 1.0; // Exact match

  const maxLength = Math.max(textLength, searchLength);
  const normalizedDistance = distance / maxLength;

  // Score decreases with distance, but never goes below 0
  return Math.max(0, 1 - normalizedDistance);
}

/**
 * Check if a text matches a search term using fuzzy matching
 */
export function fuzzyMatch(text: string, searchTerm: string, options: FuzzySearchOptions = {}): FuzzyMatch | null {
  const { maxDistance = 2, minLength = 3, ignoreCase = true, requirePrefix = false } = options;

  const normalizedText = ignoreCase ? text.toLowerCase() : text;
  const normalizedSearch = ignoreCase ? searchTerm.toLowerCase() : searchTerm;

  // Skip if text is too short
  if (normalizedText.length < minLength) {
    return null;
  }

  // Check for exact match first
  if (normalizedText === normalizedSearch) {
    return {
      text,
      distance: 0,
      score: 1.0,
    };
  }

  // Check for prefix match if required
  if (requirePrefix && !normalizedText.startsWith(normalizedSearch)) {
    return null;
  }

  // Check for substring match (exact)
  if (normalizedText.includes(normalizedSearch)) {
    return {
      text,
      distance: 0,
      score: 0.9, // Slightly lower than exact match
    };
  }

  // Calculate fuzzy distance
  const distance = levenshteinDistance(normalizedText, normalizedSearch);

  if (distance > maxDistance) {
    return null;
  }

  const score = calculateFuzzyScore(distance, normalizedText.length, normalizedSearch.length);

  return {
    text,
    distance,
    score,
  };
}

/**
 * Find fuzzy matches in an array of strings
 */
export function findFuzzyMatches(texts: string[], searchTerm: string, options: FuzzySearchOptions = {}): FuzzyMatch[] {
  const matches: FuzzyMatch[] = [];

  for (const text of texts) {
    const match = fuzzyMatch(text, searchTerm, options);
    if (match) {
      matches.push(match);
    }
  }

  // Sort by score (highest first), then by distance (lowest first)
  return matches.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return a.distance - b.distance;
  });
}

/**
 * Parse Albion Online tier and enchantment from search term
 * Examples: "8.1" -> tier 8, enchant 1; "T8.1" -> tier 8, enchant 1
 * Enchantment levels: 1, 2, 3, 4 (corresponding to .1, .2, .3, .4)
 */

/**
 * Find partial fuzzy matches for search terms within longer text
 * This is useful for matching "artic staff" within "Elder's Arctic Staff"
 */
export function findPartialFuzzyMatch(itemName: string, searchTerm: string): { score: number } | null {
  const itemLower = itemName.toLowerCase();
  const searchLower = searchTerm.toLowerCase();

  // Split search term into words
  const searchWords = searchLower.split(/\s+/);
  const itemWords = itemLower.split(/\s+/);

  // Check if all search words can be found in item words with fuzzy matching
  let totalScore = 0;
  let matchedWords = 0;

  for (const searchWord of searchWords) {
    let bestMatch = 0;

    for (const itemWord of itemWords) {
      // Check for exact substring match first
      if (itemWord.includes(searchWord)) {
        bestMatch = Math.max(bestMatch, 1.0);
      } else {
        // Check for fuzzy match within the word
        const distance = levenshteinDistance(searchWord, itemWord);
        const maxDistance = Math.min(2, Math.floor(searchWord.length / 2));

        if (distance <= maxDistance) {
          const score = 1 - distance / Math.max(searchWord.length, itemWord.length);
          bestMatch = Math.max(bestMatch, score);
        }
      }
    }

    if (bestMatch > 0) {
      totalScore += bestMatch;
      matchedWords++;
    }
  }

  // Require at least 50% of words to match
  if (matchedWords < searchWords.length * 0.5) {
    return null;
  }

  // Calculate final score
  const finalScore = totalScore / searchWords.length;

  // Only return matches with score > 0.3
  return finalScore > 0.3 ? { score: finalScore } : null;
}

/**
 * Check if an item matches tier and enchantment criteria
 */
