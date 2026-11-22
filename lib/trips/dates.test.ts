import { describe, expect, it } from "vitest";
import {
  countdownLabel,
  daysUntil,
  formatTripRange,
  nightsBetween,
  todayIn,
  tripDayNumber,
  tripPhase,
} from "./dates";

describe("tripPhase", () => {
  it("treats undated trips as upcoming", () => {
    expect(tripPhase(null, null, "2026-11-22")).toBe("upcoming");
  });
  it("classifies by date, inclusive of start and end", () => {
    expect(tripPhase("2026-12-01", "2026-12-05", "2026-11-22")).toBe("upcoming");
    expect(tripPhase("2026-12-01", "2026-12-05", "2026-12-01")).toBe("ongoing");
    expect(tripPhase("2026-12-01", "2026-12-05", "2026-12-05")).toBe("ongoing");
    expect(tripPhase("2026-12-01", "2026-12-05", "2026-12-06")).toBe("past");
  });
  it("uses start as end for single-day trips", () => {
    expect(tripPhase("2026-12-01", null, "2026-12-01")).toBe("ongoing");
    expect(tripPhase("2026-12-01", null, "2026-12-02")).toBe("past");
  });
});

describe("day math", () => {
  it("counts days until start", () => {
    expect(daysUntil("2026-12-01", "2026-11-22")).toBe(9);
    expect(daysUntil(null, "2026-11-22")).toBeNull();
  });
  it("counts nights across DST and month boundaries", () => {
    expect(nightsBetween("2026-03-27", "2026-03-31")).toBe(4);
    expect(nightsBetween("2026-12-30", "2027-01-02")).toBe(3);
    expect(nightsBetween("2026-12-30", null)).toBe(0);
  });
  it("numbers trip days from 1", () => {
    expect(tripDayNumber("2026-04-12", "2026-04-16", "2026-04-13")).toBe(2);
    expect(tripDayNumber("2026-04-12", "2026-04-16", "2026-04-20")).toBeNull();
  });
  it("gets today in a timezone", () => {
    const instant = new Date("2026-11-22T23:30:00Z");
    expect(todayIn("UTC", instant)).toBe("2026-11-22");
    expect(todayIn("Asia/Tokyo", instant)).toBe("2026-11-23");
  });
});

describe("formatTripRange", () => {
  it("formats like the design", () => {
    expect(formatTripRange("2026-04-12", "2026-04-16")).toBe("Apr 12–16");
    expect(formatTripRange("2026-04-28", "2026-05-03")).toBe("Apr 28 – May 3");
    expect(formatTripRange("2026-12-30", "2027-01-02")).toBe("Dec 30, 2026 – Jan 2, 2027");
    expect(formatTripRange(null, null)).toBe("Dates TBC");
    expect(formatTripRange("2026-04-12", null)).toBe("Apr 12");
  });
});

describe("countdownLabel", () => {
  it("covers every phase", () => {
    expect(countdownLabel("2026-12-01", "2026-12-05", "2026-11-22")).toBe("In 9 days");
    expect(countdownLabel("2026-11-23", "2026-12-05", "2026-11-22")).toBe("Tomorrow");
    expect(countdownLabel("2026-11-22", "2026-12-05", "2026-11-22")).toBe("Day 1 · happening now");
    expect(countdownLabel("2026-11-01", "2026-11-05", "2026-11-22")).toBe("Trip complete");
    expect(countdownLabel(null, null, "2026-11-22")).toBe("Add dates");
  });
});
