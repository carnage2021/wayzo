import { describe, expect, it } from "vitest";
import { formatMoney } from "./currencies";
import { createRateLimiter } from "./rate-limit";
import { createSignedToken, verifySignedToken } from "./signed-token";
import { afterSignIn, initials, safeNextPath } from "./utils";

describe("rate limiter", () => {
  it("allows `limit` hits per window then blocks until reset", () => {
    const check = createRateLimiter({ limit: 5, windowMs: 60_000 });
    for (let i = 0; i < 5; i++) expect(check("ip", 1000).allowed).toBe(true);
    const blocked = check("ip", 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(60_000);
    expect(check("other-ip", 1000).allowed).toBe(true);
    expect(check("ip", 61_001).allowed).toBe(true);
  });
});

describe("signed tokens", () => {
  const secret = "test-secret";
  it("round-trips a payload", () => {
    const t = createSignedToken({ uid: "u1", email: "a@b.co" }, secret, 60, 0);
    expect(verifySignedToken<{ uid: string }>(t, secret, 1000)?.uid).toBe("u1");
  });
  it("rejects tampering, wrong secret and expiry", () => {
    const t = createSignedToken({ uid: "u1" }, secret, 60, 0);
    const [body, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ uid: "u2", exp: 9e9 })).toString("base64url");
    expect(verifySignedToken(`${forged}.${sig}`, secret, 0)).toBeNull();
    expect(verifySignedToken(`${body}.${sig}`, "other", 0)).toBeNull();
    expect(verifySignedToken(t, secret, 61_000)).toBeNull();
    expect(verifySignedToken("garbage", secret)).toBeNull();
  });
});

describe("utils", () => {
  it("builds initials", () => {
    expect(initials("Maya Lopez")).toBe("ML");
    expect(initials("sam")).toBe("S");
    expect(initials("  ")).toBe("?");
  });
  it("only allows same-origin redirect paths", () => {
    expect(safeNextPath("/trips/abc")).toBe("/trips/abc");
    expect(safeNextPath("https://evil.com")).toBe("/trips");
    expect(safeNextPath("//evil.com")).toBe("/trips");
    expect(safeNextPath("/\\evil.com")).toBe("/trips");
    expect(safeNextPath(null)).toBe("/trips");
  });
  it("formats minor units", () => {
    expect(formatMoney(184000, "USD")).toBe("$1,840");
    expect(formatMoney(4250, "USD")).toBe("$42.50");
    expect(formatMoney(5000, "JPY")).toBe("¥5,000");
  });
});

describe("afterSignIn", () => {
  it("sends new users through onboarding and keeps the destination", () => {
    expect(afterSignIn(false, "/trips/abc")).toBe("/onboarding?next=%2Ftrips%2Fabc");
    expect(afterSignIn(true, "/trips/abc")).toBe("/trips/abc");
  });
  it("never redirects off-site", () => {
    expect(afterSignIn(true, "//evil.com")).toBe("/trips");
    expect(afterSignIn(false, "https://evil.com")).toBe("/onboarding?next=%2Ftrips");
  });
});
