/**
 * Central env access. Public values are inlined by Next at build time,
 * so they must be referenced as literal `process.env.NEXT_PUBLIC_*`.
 */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Wayzo",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
  inboundDomain: process.env.NEXT_PUBLIC_INBOUND_EMAIL_DOMAIN ?? "in.wayzo.app",
};

/** Accounts and trips need the database (Neon), the user store (MongoDB) and the auth secret. Server only. */
export function isBackendConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.MONGODB_URI && process.env.BETTER_AUTH_SECRET);
}

export function inboundAddress(code: string): string {
  return `trip-${code}@${publicEnv.inboundDomain}`;
}
