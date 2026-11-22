import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compact HMAC-signed tokens (payload.signature, base64url) for links we email,
 * e.g. extra-email verification. Server only.
 */
function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSignedToken<T extends object>(
  payload: T,
  secret: string,
  ttlSeconds: number,
  now = Date.now(),
) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(now / 1000) + ttlSeconds })).toString(
    "base64url",
  );
  return `${body}.${sign(body, secret)}`;
}

export function verifySignedToken<T extends object>(
  token: string,
  secret: string,
  now = Date.now(),
): T | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp?: number };
    if (typeof parsed.exp !== "number" || parsed.exp * 1000 < now) return null;
    return parsed;
  } catch {
    return null;
  }
}
