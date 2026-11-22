import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db";
import { toProfile } from "@/lib/db/rows";
import { profiles } from "@/lib/db/schema";
import { ensureProfile } from "./profile";
import { getAuth } from "./server";

export type SessionUser = {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
};

/** Current user from the Better Auth session cookie (verified server-side), deduped per request. */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const auth = getAuth();
  if (!auth) return null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return null;
    const u = session.user;
    return {
      id: u.id,
      email: u.email ?? null,
      emailVerified: u.emailVerified,
      name: u.name || null,
      image: u.image ?? null,
    };
  } catch (e) {
    console.error("[auth] getSession failed", e instanceof Error ? e.message : e);
    return null;
  }
});

export async function requireUser(next?: string) {
  const user = await getUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

/** The user's Wayzo profile (Neon); created on the fly if sign-up happened before the profile hook existed. */
export const getProfile = cache(async (userId: string) => {
  if (!isDbConfigured()) return null;
  const [row] = await db().select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  if (row) return toProfile(row);
  const user = await getUser();
  if (!user || user.id !== userId || !user.email) return null;
  await ensureProfile({ id: user.id, email: user.email, name: user.name, image: user.image });
  const [created] = await db().select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return created ? toProfile(created) : null;
});
