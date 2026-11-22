/**
 * Dependency-free email check for client components (keeps Zod out of the browser bundle).
 * Same rule as `emailSchema` on the server, which stays the source of truth.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  return v.length <= 254 && EMAIL_RE.test(v) ? v : null;
}
