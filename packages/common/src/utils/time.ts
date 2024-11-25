type unit = "days" | "hours" | "minutes" | "seconds";

export function getMilliseconds(t: number, unit: unit) {
  const ms = {
    days: 27 * 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    minutes: 60 * 1000,
    seconds: 1000,
  };
  return t * ms[unit];
}
