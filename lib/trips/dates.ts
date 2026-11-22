/**
 * Trip date helpers. Trip dates are plain calendar dates (YYYY-MM-DD) in the
 * trip's local sense, so all math is done in UTC on date-only values.
 */

export type TripPhase = "upcoming" | "ongoing" | "past";

const DAY_MS = 86_400_000;

/** Parse YYYY-MM-DD to a UTC midnight timestamp. */
export function parseDate(d: string): number {
  return Date.parse(`${d}T00:00:00Z`);
}

/** Today's date (YYYY-MM-DD) in the given IANA timezone. */
export function todayIn(timeZone?: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Undated trips count as upcoming (they're still being planned). */
export function tripPhase(start: string | null, end: string | null, today: string): TripPhase {
  if (!start) return "upcoming";
  const last = end ?? start;
  if (today < start) return "upcoming";
  if (today > last) return "past";
  return "ongoing";
}

/** Whole days from `today` until `start` (0 = today). Null if no start date. */
export function daysUntil(start: string | null, today: string): number | null {
  if (!start) return null;
  return Math.round((parseDate(start) - parseDate(today)) / DAY_MS);
}

/** Number of nights between start and end (end exclusive). */
export function nightsBetween(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  return Math.max(0, Math.round((parseDate(end) - parseDate(start)) / DAY_MS));
}

/** 1-based trip day for `today`, or null if outside the trip. */
export function tripDayNumber(start: string | null, end: string | null, today: string): number | null {
  if (!start || tripPhase(start, end, today) !== "ongoing") return null;
  return Math.round((parseDate(today) - parseDate(start)) / DAY_MS) + 1;
}

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const year = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "UTC" });

/** "Apr 12–16", "Apr 28 – May 3", "Dec 30, 2026 – Jan 2, 2027", or "Dates TBC". */
export function formatTripRange(start: string | null, end: string | null): string {
  if (!start) return "Dates TBC";
  const s = new Date(parseDate(start));
  if (!end || end === start) return monthDay.format(s);
  const e = new Date(parseDate(end));
  if (year.format(s) !== year.format(e)) {
    return `${monthDay.format(s)}, ${year.format(s)} – ${monthDay.format(e)}, ${year.format(e)}`;
  }
  if (month.format(s) === month.format(e)) {
    return `${monthDay.format(s)}–${e.getUTCDate()}`;
  }
  return `${monthDay.format(s)} – ${monthDay.format(e)}`;
}

/** Human countdown label for a trip card. */
export function countdownLabel(start: string | null, end: string | null, today: string): string {
  const phase = tripPhase(start, end, today);
  if (phase === "ongoing") {
    const day = tripDayNumber(start, end, today);
    return day ? `Day ${day} · happening now` : "Happening now";
  }
  if (phase === "past") return "Trip complete";
  const days = daysUntil(start, today);
  if (days === null) return "Add dates";
  if (days === 0) return "Starts today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}
