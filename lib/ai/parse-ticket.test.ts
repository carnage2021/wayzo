import { describe, expect, it } from "vitest";
import { ParseResult } from "./schemas";
import { looksIncomplete, serviceNumbers } from "./parse-ticket";

const leg = (start: string) => ({ type: "flight", start_at: start, booking_code: "XK47TP" });

describe("serviceNumbers", () => {
  it("finds flight and train numbers", () => {
    expect([...serviceNumbers("VJ1806 Jan 12 ... VJ1805 Jan 17 ... VJ1806 again")]).toEqual(["VJ1806", "VJ1805"]);
    expect([...serviceNumbers("Flight TP 1351 Operated by TAP")]).toEqual(["TP1351"]);
    expect([...serviceNumbers("EZY8217 out, EZY8218 back")]).toEqual(["EZY8217", "EZY8218"]);
  });
  it("ignores times, dates and long reference numbers", () => {
    expect(serviceNumbers("14:30 on 20.05.2027, PNR 2417836590").size).toBe(0);
  });
});

describe("looksIncomplete", () => {
  const text = (t: string) => [{ kind: "text" as const, text: t }];
  it("flags a two-flight itinerary that came back with one leg", () => {
    const one = ParseResult.parse({ is_travel_document: true, bookings: [leg("2027-01-12T23:50")] });
    expect(looksIncomplete(text("VJ1806 Jan 12 ... VJ1805 Jan 17"), one)).toBe(true);
  });
  it("is satisfied when every leg is there", () => {
    const two = ParseResult.parse({ is_travel_document: true, bookings: [leg("2027-01-12T23:50"), leg("2027-01-17T18:50")] });
    expect(looksIncomplete(text("VJ1806 Jan 12 ... VJ1805 Jan 17"), two)).toBe(false);
  });
  it("flags a missing return leg by wording", () => {
    const one = ParseResult.parse({ is_travel_document: true, bookings: [leg("2027-06-02T06:45")] });
    expect(looksIncomplete(text("OUTBOUND Wed 02 Jun ... RETURN Mon 07 Jun"), one)).toBe(true);
  });
  it("leaves stays and single journeys alone", () => {
    const stay = ParseResult.parse({ is_travel_document: true, bookings: [{ type: "stay", start_at: "2027-04-12" }] });
    expect(looksIncomplete(text("Hotel booking, room 2041"), stay)).toBe(false);
    const one = ParseResult.parse({ is_travel_document: true, bookings: [leg("2027-04-12T11:05")] });
    expect(looksIncomplete(text("Flight TP 1351 LHR to LIS"), one)).toBe(false);
  });
});
