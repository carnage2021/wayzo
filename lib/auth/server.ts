import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { publicEnv } from "@/lib/env";
import { sendEmail, resetPasswordEmail } from "@/lib/notifications/email";
import { ensureProfile } from "./profile";

/**
 * Better Auth: users, sessions and linked accounts live in MongoDB (MONGODB_URI).
 * Sign-in: email + password now; Google turns on when GOOGLE_CLIENT_ID/SECRET are set.
 * Wayzo's own profile row (Neon `profiles`) is created on sign-up.
 */
function create() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !process.env.BETTER_AUTH_SECRET) return null;
  const client = new MongoClient(uri);
  const google =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
      : undefined;

  return betterAuth({
    appName: "Wayzo",
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? publicEnv.appUrl,
    // Requests must come from these origins (CSRF protection). Extra ones (e.g. a custom domain)
    // go in BETTER_AUTH_TRUSTED_ORIGINS, comma-separated; any localhost port is fine in development.
    trustedOrigins: [
      publicEnv.appUrl,
      process.env.BETTER_AUTH_URL,
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "").split(","),
      ...(process.env.NODE_ENV === "development" ? ["http://localhost:*"] : []),
    ]
      .map((o) => o?.trim())
      .filter((o): o is string => Boolean(o)),
    database: mongodbAdapter(client.db(), { client }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      autoSignIn: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user, url }) => {
        const res = await sendEmail(resetPasswordEmail(user.email, url));
        if (!res.sent && process.env.NODE_ENV !== "production") console.info(`[reset-password:dev] ${url}`);
      },
    },
    socialProviders: google,
    session: {
      expiresIn: 60 * 60 * 24 * 14,
      updateAge: 60 * 60 * 24,
      // Signed cookie cache: most requests skip the database lookup for 5 minutes.
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    rateLimit: { enabled: true, window: 60, max: 30 },
    advanced: { cookiePrefix: "wayzo" },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensureProfile({
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image ?? null,
            });
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

type Auth = NonNullable<ReturnType<typeof create>>;
const globalForAuth = globalThis as unknown as { __wayzoAuth?: Auth | null };

/** The Better Auth instance, or null when MONGODB_URI / BETTER_AUTH_SECRET are missing. */
export function getAuth(): Auth | null {
  if (globalForAuth.__wayzoAuth === undefined) globalForAuth.__wayzoAuth = create();
  return globalForAuth.__wayzoAuth;
}

export function isGoogleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
