import { createPreprocessor, Preprocessor } from "./";

/**
 * Parses time from various formats and returns a Date object
 * @param timeString - Time string in various formats (20:30, 8:30 PM, etc.)
 * @returns Date object with the time set
 */
export function parseTimeString(timeString: string): Date {
  const now = new Date();
  const date = new Date(now);

  // Reset to start of day
  date.setHours(0, 0, 0, 0);

  if (!timeString) return date;

  const normalizedTime = timeString.trim().toLowerCase();

  // Handle 24-hour format (20:30)
  const time24Match = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const hours = parseInt(time24Match[1], 10);
    const minutes = parseInt(time24Match[2], 10);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  // Handle 12-hour format (8:30 PM)
  const time12Match = normalizedTime.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (time12Match) {
    let hours = parseInt(time12Match[1], 10);
    const minutes = parseInt(time12Match[2], 10);
    const period = time12Match[3];

    if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59) {
      if (period === "pm" && hours !== 12) {
        hours += 12;
      } else if (period === "am" && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }

  // Handle just hours (20h, 8pm)
  const hourMatch = normalizedTime.match(/^(\d{1,2})(?:\s*(am|pm))?$/);
  if (hourMatch) {
    let hours = parseInt(hourMatch[1], 10);
    const period = hourMatch[2];

    if (hours >= 0 && hours <= 23) {
      if (period === "pm" && hours !== 12) {
        hours += 12;
      } else if (period === "am" && hours === 12) {
        hours = 0;
      }

      date.setHours(hours, 0, 0, 0);
      return date;
    }
  }

  // If no valid time found, return today at 00:00
  return date;
}

/**
 * Extracts time information from a message
 * @param message - The Discord message
 * @returns Time string if found, null otherwise
 */
export function extractTimeFromMessage(message: string): string | null {
  const lines = message.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Look for time patterns
    const timePatterns = [
      /\b(\d{1,2}:\d{2})\b/, // 20:30
      /\b(\d{1,2}:\d{2}\s*(?:am|pm))\b/i, // 8:30 PM
      /\b(\d{1,2}(?:\s*(?:am|pm))?)\b/i, // 20, 8pm
    ];

    for (const pattern of timePatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        return match[1];
      }
    }
  }

  return null;
}

export const timePreprocessor: Preprocessor = createPreprocessor((context) => {
  const time = extractTimeFromMessage(context.originalMessage);

  return {
    extractedTime: time,
  };
});
