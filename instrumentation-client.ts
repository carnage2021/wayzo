/**
 * Browser Sentry init. The SDK is only downloaded when NEXT_PUBLIC_SENTRY_DSN is set,
 * so it never weighs on the landing page otherwise.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
    });
  });
}
