import { describe, expect, it } from "vitest";
import { tripInputSchema, waitlistSchema } from "./schemas";

describe("waitlistSchema", () => {
  it("normalises email and defaults travels_with to Friends", () => {
    const r = waitlistSchema.parse({ email: "  Maya@Example.COM " });
    expect(r).toEqual({ email: "maya@example.com", travels_with: "Friends" });
  });
  it("rejects invalid emails and unknown groups", () => {
    expect(waitlistSchema.safeParse({ email: "nope" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: "a@b" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: "a@b.co", travels_with: "Coworkers" }).success).toBe(false);
  });
});

describe("tripInputSchema", () => {
  const base = { name: "Lisbon Trip", destinations: [], start_date: null, end_date: null, currency: "eur" };

  it("accepts an undated trip and uppercases currency", () => {
    const r = tripInputSchema.parse(base);
    expect(r.currency).toBe("EUR");
  });
  it("requires a name", () => {
    expect(tripInputSchema.safeParse({ ...base, name: "  " }).success).toBe(false);
  });
  it("rejects end before start", () => {
    const r = tripInputSchema.safeParse({ ...base, start_date: "2026-04-16", end_date: "2026-04-12" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["end_date"]);
  });
  it("rejects an end date without a start date", () => {
    expect(tripInputSchema.safeParse({ ...base, end_date: "2026-04-12" }).success).toBe(false);
  });
  it("rejects unsupported currencies", () => {
    expect(tripInputSchema.safeParse({ ...base, currency: "XYZ" }).success).toBe(false);
  });
});
