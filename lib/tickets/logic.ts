/**
 * Pure ticket logic (no I/O): status from confidence, duplicate keys, money, day matching,
 * trip-date checks and local-time -> UTC. Unit tested in logic.test.ts.
 */
import type { BookingType, ConfidenceField, ParsedBooking } from "@/lib/ai/schemas";
import { parseDate } from "@/lib/trips/dates";

export type BookingStatus = "confirmed" | "needs_review" | "discarded";

export const CONFIRM_THRESHOLD = 0.85;
const TRANSPORT: BookingType[] = ["flight", "train", "bus", "ferry"];

export function isTransport(type: BookingType): boolean {
  return TRANSPORT.includes(type);
}

/** Fields whose confidence decides auto-confirm, per booking type. */
export function keyFields(type: BookingType): ConfidenceField[] {
  if (isTransport(type)) return ["type", "start_at", "from_place", "to_place", "booking_code"];
  if (type === "stay") return ["type", "start_at", "end_at", "to_place"];
  if (type === "car_rental") return ["type", "start_at", "end_at"];
  return ["type", "start_at", "to_place"];
}

/** The fields to highlight on the review screen. */
export function uncertainFields(b: Pick<ParsedBooking, "type" | "confidence">): ConfidenceField[] {
  return keyFields(b.type).filter((f) => (b.confidence[f] ?? 0) < CONFIRM_THRESHOLD);
}

/** confirmed when every key field is read with high confidence and a start time exists. */
export function statusFor(b: ParsedBooking): "confirmed" | "needs_review" {
  if (!b.start_at || b.type === "other") return "needs_review";
  return uncertainFields(b).length === 0 ? "confirmed" : "needs_review";
}

/**
 * Duplicate key: provider + booking code + start date. The date keeps the legs of one
 * booking (same code for outbound and return) apart. Null when there is no code.
 */
export function dedupeKey(b: Pick<ParsedBooking, "provider" | "booking_code" | "start_at">): string | null {
  if (!b.booking_code) return null;
  const provider = (b.provider ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${provider}|${b.booking_code.toUpperCase()}|${b.start_at?.slice(0, 10) ?? ""}`;
}

/** Number of minor-unit digits for a currency (JPY 0, USD 2, ...). */
export function currencyDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export function toMinor(price: number | null, currency: string | null): number | null {
  if (price === null || !currency) return null;
  return Math.round(price * 10 ** currencyDigits(currency));
}

/** 1-based trip day of a booking's start date, or null if outside the trip / unknown. */
export function tripDay(
  tripStart: string | null,
  tripEnd: string | null,
  startAt: string | null,
): number | null {
  if (!tripStart || !startAt) return null;
  const d = startAt.slice(0, 10);
  if (d < tripStart || (tripEnd && d > tripEnd)) return null;
  return Math.round((parseDate(d) - parseDate(tripStart)) / 86_400_000) + 1;
}

export type DateRange = { start: string; end: string };

/** The date range bookings cover (start of the first, end of the last), or null when undated. */
export function bookingsRange(bookings: Pick<ParsedBooking, "start_at" | "end_at">[]): DateRange | null {
  const dates = bookings
    .flatMap((b) => [b.start_at, b.end_at])
    .filter((d): d is string => Boolean(d))
    .map((d) => d.slice(0, 10))
    .sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first && last ? { start: first, end: last } : null;
}

/** If bookings fall outside the trip dates, the range the trip would need to cover them. */
export function extensionNeeded(
  trip: { start_date: string | null; end_date: string | null },
  bookings: Pick<ParsedBooking, "start_at" | "end_at">[],
): DateRange | null {
  const r = bookingsRange(bookings);
  if (!r || !trip.start_date) return null;
  const end = trip.end_date ?? trip.start_date;
  if (r.start >= trip.start_date && r.end <= end) return null;
  return { start: r.start < trip.start_date ? r.start : trip.start_date, end: r.end > end ? r.end : end };
}

/** Validates an IANA zone name. */
export function isTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** "2027-04-12T11:05" in `tz` -> the UTC instant. Date-only values are treated as 12:00 local. */
export function localToUtc(local: string, tz: string | null): Date | null {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  if (!m) return null;
  const [y, mo, d, h = "12", mi = "00"] = m.slice(1);
  const asUtc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  if (!isTimeZone(tz)) return new Date(asUtc);
  // Offset of tz at that moment, found by formatting the guess in tz and comparing (two passes for DST edges).
  const offsetAt = (t: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(new Date(t));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute")) - t;
  };
  let t = asUtc - offsetAt(asUtc);
  t = asUtc - offsetAt(t);
  return new Date(t);
}

/** Short human title for a booking: "LHR → LIS", "Alfama view flat", ... */
export function bookingTitle(b: {
  type: BookingType;
  provider: string | null;
  from_place: string | null;
  to_place: string | null;
}): string {
  const short = (p: string | null) => {
    if (!p) return null;
    const code = p.match(/\(([A-Z]{3})\)/);
    return code?.[1] ?? p.split(",")[0]?.trim() ?? p;
  };
  if (isTransport(b.type) && (b.from_place || b.to_place)) {
    return [short(b.from_place) ?? "?", short(b.to_place) ?? "?"].join(" → ");
  }
  return b.provider ?? short(b.to_place) ?? "Booking";
}

export const TYPE_LABEL: Record<BookingType, string> = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  ferry: "Ferry",
  stay: "Stay",
  car_rental: "Car rental",
  restaurant: "Restaurant",
  activity: "Activity",
  event: "Event",
  other: "Booking",
};
