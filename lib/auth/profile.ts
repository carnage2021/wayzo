import "server-only";
import { db } from "@/lib/db";
import { profiles, userEmails } from "@/lib/db/schema";

/**
 * Creates the Wayzo profile (Neon) for a Better Auth user, plus their sign-in email.
 * Idempotent: safe to call on every sign-up or when a profile is found missing.
 */
export async function ensureProfile(user: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}) {
  const email = user.email.trim().toLowerCase();
  await db().batch([
    db()
      .insert(profiles)
      .values({ id: user.id, email, name: user.name || null, avatarUrl: user.image })
      .onConflictDoNothing(),
    // The sign-in email is the primary address; it's verified once email verification exists.
    db().insert(userEmails).values({ userId: user.id, email, primary: true }).onConflictDoNothing(),
  ]);
}
