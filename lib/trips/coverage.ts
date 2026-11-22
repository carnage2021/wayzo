import { nightsBetween, parseDate } from "./dates";

const DAY_MS = 86_400_000;

export type StayRange = { start_at: string | null; end_at: string | null };

/**
 * Nights of the trip covered by at least one stay booking.
 * A night is identified by its date (check-in date); a stay from 12th to 14th covers nights 12 and 13.
 * Overlapping stays are not double counted.
 */
export function stayCoverage(
  tripStart: string | null,
  tripEnd: string | null,
  stays: StayRange[],
): { covered: number; total: number; gaps: number } {
  const total = nightsBetween(tripStart, tripEnd);
  if (!tripStart || !tripEnd || total === 0) return { covered: 0, total, gaps: 0 };

  const first = parseDate(tripStart);
  const covered = new Set<number>();
  for (const s of stays) {
    if (!s.start_at || !s.end_at) continue;
    const from = parseDate(s.start_at.slice(0, 10));
    const to = parseDate(s.end_at.slice(0, 10));
    for (let t = from; t < to; t += DAY_MS) {
      const idx = Math.round((t - first) / DAY_MS);
      if (idx >= 0 && idx < total) covered.add(idx);
    }
  }
  return { covered: covered.size, total, gaps: total - covered.size };
}
