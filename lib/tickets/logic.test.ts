import { describe, expect, it } from "vitest";
import { ParseResult, ParsedBooking } from "@/lib/ai/schemas";
import {
  bookingTitle,
  bookingsRange,
  dedupeKey,
  extensionNeeded,
  localToUtc,
  statusFor,
  toMinor,
  tripDay,
  uncertainFields,
} from "./logic";

const high = {
  type: 0.98,
  start_at: 0.95,
  end_at: 0.95,
  from_place: 0.95,
  to_place: 0.95,
  booking_code: 0.99,
};

function booking(over: Record<string, unknown> = {}) {
  return ParsedBooking.parse({
    type: "flight",
    provider: "Vietjet",
    booking_code: "QU68SP",
    travellers: ["RIVERA, ALEX"],
    start_at: "2027-01-12T23:50",
    end_at: "2027-01-13T06:20",
    timezone: "Asia/Kolkata",
    from_place: "Ahmedabad (AMD)",
    to_place: "Ho Chi Minh City (SGN)",
    address: null,
    seat_or_room: null,
    price: 856.17,
    currency: "usd",
    contact: null,
    notes: null,
    confidence: high,
    ...over,
  });
}

describe("ParsedBooking normalisation", () => {
  it("cleans model output into the stored shape", () => {
    const b = booking({
      type: "Hotel",
      booking_code: " ab 12 ",
      currency: "usd",
      start_at: "2027-01-12T23:50:00+05:30",
      seat_or_room: "N/A",
    });
    expect(b.type).toBe("stay");
    expect(b.booking_code).toBe("AB12");
    expect(b.currency).toBe("USD");
    expect(b.start_at).toBe("2027-01-12T23:50");
    expect(b.seat_or_room).toBeNull();
  });
  it("tolerates missing confidence and unknown types", () => {
    const r = ParseResult.parse({
      is_travel_document: true,
      bookings: [{ type: "spaceship", start_at: "nope" }],
    });
    expect(r.bookings[0]?.type).toBe("other");
    expect(r.bookings[0]?.start_at).toBeNull();
    expect(r.bookings[0]?.confidence.start_at).toBe(0);
  });
});

describe("status and review fields", () => {
  it("auto-confirms high-confidence bookings", () => {
    expect(statusFor(booking())).toBe("confirmed");
  });
  it("sends low-confidence key fields to review", () => {
    const b = booking({ confidence: { ...high, to_place: 0.5 } });
    expect(statusFor(b)).toBe("needs_review");
    expect(uncertainFields(b)).toEqual(["to_place"]);
  });
  it("ignores from_place for stays", () => {
    const stay = booking({ type: "stay", confidence: { ...high, from_place: 0 } });
    expect(statusFor(stay)).toBe("confirmed");
  });
  it("needs review when there is no start time", () => {
    expect(statusFor(booking({ start_at: null }))).toBe("needs_review");
  });
});

describe("dedupeKey", () => {
  it("keeps outbound and return legs with the same code apart", () => {
    const out = dedupeKey(booking());
    const ret = dedupeKey(booking({ start_at: "2027-01-17T18:50" }));
    expect(out).not.toBe(ret);
    expect(dedupeKey(booking())).toBe(out);
  });
  it("is null without a booking code", () => {
    expect(dedupeKey(booking({ booking_code: null }))).toBeNull();
  });
});

describe("money and dates", () => {
  it("converts to minor units per currency", () => {
    expect(toMinor(856.17, "USD")).toBe(85617);
    expect(toMinor(12000, "JPY")).toBe(12000);
    expect(toMinor(null, "USD")).toBeNull();
  });
  it("matches a trip day", () => {
    expect(tripDay("2027-01-12", "2027-01-17", "2027-01-13T06:20")).toBe(2);
    expect(tripDay("2027-01-12", "2027-01-17", "2027-01-20T10:00")).toBeNull();
  });
  it("finds the range and the extension a trip needs", () => {
    const legs = [booking(), booking({ start_at: "2027-01-17T18:50", end_at: "2027-01-17T22:50" })];
    expect(bookingsRange(legs)).toEqual({ start: "2027-01-12", end: "2027-01-17" });
    expect(extensionNeeded({ start_date: "2027-01-13", end_date: "2027-01-16" }, legs)).toEqual({
      start: "2027-01-12",
      end: "2027-01-17",
    });
    expect(extensionNeeded({ start_date: "2027-01-12", end_date: "2027-01-17" }, legs)).toBeNull();
  });
  it("converts local time in a zone to UTC", () => {
    expect(localToUtc("2027-01-12T23:50", "Asia/Kolkata")?.toISOString()).toBe("2027-01-12T18:20:00.000Z");
    expect(localToUtc("2027-07-01T09:00", "Europe/Lisbon")?.toISOString()).toBe("2027-07-01T08:00:00.000Z");
    expect(localToUtc("2027-01-12", null)?.toISOString()).toBe("2027-01-12T12:00:00.000Z");
  });
  it("titles bookings", () => {
    expect(bookingTitle(booking())).toBe("AMD → SGN");
    expect(
      bookingTitle({ type: "stay", provider: "Alfama view flat", from_place: null, to_place: null }),
    ).toBe("Alfama view flat");
  });
});
