import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { toProfile } from "@/lib/firebase/convert";
import { SESSION_COOKIE } from "@/lib/firebase/session";

export type SessionUser = { id: string; email: string | null; emailVerified: boolean };

/**
 * Current user from the httpOnly Firebase session cookie, verified with the
 * Admin SDK (including revocation, so sign-out everywhere works). Deduped per request.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const auth = adminAuth();
  if (!auth) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await auth.verifySessionCookie(cookie, true);
    return { id: decoded.uid, email: decoded.email ?? null, emailVerified: decoded.email_verified ?? false };
  } catch {
    return null;
  }
});

export async function requireUser(next?: string) {
  const user = await getUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

export const getProfile = cache(async (userId: string) => {
  const db = adminDb();
  if (!db) return null;
  return toProfile(await db.collection("users").doc(userId).get());
});
