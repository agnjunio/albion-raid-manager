/**
 * Creates a Discord timestamp that shows relative time
 * @param date - The date to format
 * @returns Discord timestamp string
 */
export function createDiscordTimestamp(date: Date): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:R>`;
}

/**
 * Creates a Discord timestamp with specific format
 * @param date - The date to format
 * @param format - The format type ('t', 'T', 'd', 'D', 'f', 'F', 'R')
 * @returns Discord timestamp string
 */
export function createDiscordTimestampWithFormat(
  date: Date,
  format: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "R",
): string {
  const timestamp = Math.floor(date.getTime() / 1000);
  return `<t:${timestamp}:${format}>`;
}
