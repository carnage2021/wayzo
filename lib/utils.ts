import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** First letter of first + last word, uppercased. "Maya Lopez" -> "ML". */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

const AVATAR_FILLS = ["var(--avatar-1)", "var(--avatar-2)", "var(--avatar-3)"] as const;

/** Stable avatar fill per user id. */
export function avatarFill(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_FILLS[h % AVATAR_FILLS.length] ?? AVATAR_FILLS[0];
}

/** Only allow same-origin relative paths as redirect targets. */
export function safeNextPath(next: string | null | undefined, fallback = "/trips"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/** Where to send someone right after sign-in: new users answer the onboarding questions first. */
export function afterSignIn(onboarded: boolean, next: string): string {
  const dest = safeNextPath(next);
  return onboarded ? dest : `/onboarding?next=${encodeURIComponent(dest)}`;
}
