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

/** Firebase web config. These values are public by design (security comes from rules + server checks). */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

/** Browser half: enough to show the sign-in screen. */
export function isFirebaseClientConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

/** Server half: service-account credentials for sessions and Firestore (server only). */
export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
  );
}

/** Both halves are needed for accounts and trips. */
export function isFirebaseConfigured(): boolean {
  return isFirebaseClientConfigured() && isFirebaseAdminConfigured();
}

export function inboundAddress(code: string): string {
  return `trip-${code}@${publicEnv.inboundDomain}`;
}
