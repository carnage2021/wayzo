/**
 * Central env access. Public values are inlined by Next at build time,
 * so they must be referenced as literal `process.env.NEXT_PUBLIC_*`.
 */
export const publicEnv = {
  // NEXT_PUBLIC_APP_URL, else the Vercel production URL, else local dev.
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Wayzo",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
  /** Email domain for trip forwarding addresses; empty until we own a domain (feature shows "coming soon"). */
  inboundDomain: process.env.NEXT_PUBLIC_INBOUND_EMAIL_DOMAIN ?? "",
};

/** Accounts and trips need the database (Neon), the user store (MongoDB) and the auth secret. Server only. */
export function isBackendConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.MONGODB_URI && process.env.BETTER_AUTH_SECRET);
}

/** trip-<code>@<domain>, or null while no inbound email domain is configured. */
export function inboundAddress(code: string): string | null {
  return publicEnv.inboundDomain ? `trip-${code}@${publicEnv.inboundDomain}` : null;
}
