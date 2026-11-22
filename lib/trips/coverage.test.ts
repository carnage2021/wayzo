import { describe, expect, it } from "vitest";
import { stayCoverage } from "./coverage";

describe("stayCoverage", () => {
  it("returns zeros for undated trips", () => {
    expect(stayCoverage(null, null, [])).toEqual({ covered: 0, total: 0, gaps: 0 });
  });

  it("counts nights by check-in date, end exclusive", () => {
    const r = stayCoverage("2026-04-12", "2026-04-16", [
      { start_at: "2026-04-12T15:00:00", end_at: "2026-04-14T11:00:00" },
    ]);
    expect(r).toEqual({ covered: 2, total: 4, gaps: 2 });
  });

  it("does not double count overlapping stays and clips to the trip", () => {
    const r = stayCoverage("2026-04-12", "2026-04-16", [
      { start_at: "2026-04-10T15:00:00", end_at: "2026-04-14T11:00:00" },
      { start_at: "2026-04-13T15:00:00", end_at: "2026-04-20T11:00:00" },
    ]);
    expect(r).toEqual({ covered: 4, total: 4, gaps: 0 });
  });

  it("ignores stays with missing dates", () => {
    expect(stayCoverage("2026-04-12", "2026-04-14", [{ start_at: null, end_at: null }]).covered).toBe(0);
  });
});
