/**
 * Fixed-window in-memory rate limiter.
 * Good enough per server instance; swap for Upstash/Redis when running multiple
 * Vercel instances (the interface stays the same).
 */
type Bucket = { count: number; resetAt: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string, now: number = Date.now()): { allowed: boolean; retryAfterMs: number } {
    // Opportunistic cleanup so the map can't grow without bound.
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }
    if (bucket.count >= limit) return { allowed: false, retryAfterMs: bucket.resetAt - now };
    bucket.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  };
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
