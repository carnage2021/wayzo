"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, count, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getUser } from "@/lib/auth";
import { getAuth } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { aiUsage, profiles, tripMembers, trips, userEmails } from "@/lib/db/schema";
import { publicEnv } from "@/lib/env";
import { sendEmail, verifyEmailEmail } from "@/lib/notifications/email";
import { createSignedToken } from "@/lib/signed-token";
import { UUID_RE } from "@/lib/trips/queries";
import { deleteTripFiles } from "@/lib/uploads";
import { emailSchema, fieldErrors, profileSchema, type ProfileInput } from "@/lib/validation/schemas";

type FieldResult<T> = ActionResult<T> & { fields?: Record<string, string> };

function profileFields(p: ProfileInput) {
  return {
    name: p.name,
    homeCity: p.home_city || null,
    currency: p.currency,
    foodPref: p.food_pref ?? null,
    emailNotifications: p.email_notifications,
    pushNotifications: p.push_notifications,
  };
}

export async function updateProfile(raw: unknown): Promise<FieldResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };

  try {
    await db().update(profiles).set(profileFields(parsed.data)).where(eq(profiles.id, user.id));
  } catch {
    return fail("We couldn't save your profile. Please try again.");
  }
  revalidatePath("/", "layout");
  return ok(null);
}

/** Saves onboarding answers (or just marks it done when skipped) and continues. */
export async function completeOnboarding(
  raw: unknown,
  next: string,
  skip = false,
): Promise<FieldResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");

  // Store the browser timezone for briefs at 07:00 local (falls back to trip timezone later).
  const tz = z
    .string()
    .max(64)
    .regex(/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$/)
    .safeParse((raw as { timezone?: unknown } | null)?.timezone);
  const base = { onboardedAt: new Date(), timezone: tz.success ? tz.data : null };

  let update: Partial<typeof profiles.$inferInsert> = base;
  if (!skip) {
    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success)
      return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };
    update = { ...profileFields(parsed.data), ...base };
  }
  try {
    await db().update(profiles).set(update).where(eq(profiles.id, user.id));
  } catch {
    return fail("We couldn't save your details. Please try again.");
  }

  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/trips";
  redirect(dest);
}

// ---------- Extra emails (F2): bookings forwarded from these are recognised ----------
// One address belongs to one account (unique index on user_emails.email).

const VERIFY_TTL_SECONDS = 60 * 60 * 24;

async function sendVerification(userId: string, rowId: string, email: string) {
  const secret = process.env.APP_SECRET;
  if (!secret) return { sent: false as const };
  const token = createSignedToken({ uid: userId, rid: rowId, email }, secret, VERIFY_TTL_SECONDS);
  const link = `${publicEnv.appUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const res = await sendEmail(verifyEmailEmail(email, link));
  if (!res.sent && process.env.NODE_ENV !== "production") console.info(`[verify-email:dev] ${link}`);
  return res;
}

export async function addEmail(raw: string): Promise<ActionResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) return fail("Please enter a valid email address.");
  if (parsed.data === user.email?.toLowerCase()) return fail("That's already your sign-in email.");

  const [{ n } = { n: 0 }] = await db()
    .select({ n: count() })
    .from(userEmails)
    .where(eq(userEmails.userId, user.id));
  if (n >= 5) return fail("You can add up to 5 emails.");

  // Someone else's unverified claim expires with its link, so nobody can squat an address.
  const [existing] = await db().select().from(userEmails).where(eq(userEmails.email, parsed.data)).limit(1);
  if (existing) {
    const stale =
      !existing.verifiedAt &&
      existing.userId !== user.id &&
      Date.now() - existing.createdAt.getTime() > VERIFY_TTL_SECONDS * 1000;
    if (!stale) return fail("That email is already linked to an account.");
    await db().delete(userEmails).where(eq(userEmails.id, existing.id));
  }

  let id: string;
  try {
    const [row] = await db()
      .insert(userEmails)
      .values({ userId: user.id, email: parsed.data, primary: false })
      .returning({ id: userEmails.id });
    id = row!.id;
  } catch {
    return fail("That email is already linked to an account.");
  }
  await sendVerification(user.id, id, parsed.data);
  revalidatePath("/account");
  return ok(null);
}

export async function resendVerification(rowId: string): Promise<ActionResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  if (!UUID_RE.test(rowId)) return fail("Email not found.");
  const [row] = await db()
    .select()
    .from(userEmails)
    .where(and(eq(userEmails.id, rowId), eq(userEmails.userId, user.id)))
    .limit(1);
  if (!row) return fail("Email not found.");
  if (row.verifiedAt) return fail("That email is already verified.");
  await sendVerification(user.id, row.id, row.email);
  return ok(null);
}

export async function removeEmail(rowId: string): Promise<ActionResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  if (!UUID_RE.test(rowId)) return fail("We couldn't remove that email.");
  const removed = await db()
    .delete(userEmails)
    .where(and(eq(userEmails.id, rowId), eq(userEmails.userId, user.id), eq(userEmails.primary, false)))
    .returning({ id: userEmails.id });
  if (!removed.length) return fail("We couldn't remove that email.");
  revalidatePath("/account");
  return ok(null);
}

// ---------- Delete account (F2) ----------

export async function deleteAccount(confirmation: string): Promise<ActionResult<never>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  if (confirmation.trim() !== "DELETE") return fail('Type "DELETE" to confirm.');
  const auth = getAuth();
  if (!auth) return fail("Account deletion isn't configured on this server yet.");
  const uid = user.id;

  try {
    // Trips I own: hand over to the longest-standing member, or delete the trip if I'm alone.
    const owned = await db().select({ id: trips.id }).from(trips).where(eq(trips.ownerId, uid));
    for (const { id } of owned) {
      const [heir] = await db()
        .select({ userId: tripMembers.userId })
        .from(tripMembers)
        .where(and(eq(tripMembers.tripId, id), ne(tripMembers.userId, uid)))
        .orderBy(asc(tripMembers.joinedAt))
        .limit(1);
      if (!heir) {
        await deleteTripFiles([id]);
        await db().delete(trips).where(eq(trips.id, id));
        continue;
      }
      await db().batch([
        db().update(trips).set({ ownerId: heir.userId, updatedAt: new Date() }).where(eq(trips.id, id)),
        db()
          .update(tripMembers)
          .set({ role: "owner" })
          .where(and(eq(tripMembers.tripId, id), eq(tripMembers.userId, heir.userId))),
      ]);
    }

    await db().batch([
      db().delete(tripMembers).where(eq(tripMembers.userId, uid)),
      db().delete(userEmails).where(eq(userEmails.userId, uid)),
      db().delete(aiUsage).where(eq(aiUsage.userId, uid)),
      db().delete(profiles).where(eq(profiles.id, uid)),
    ]);

    // Finally the login itself (MongoDB): sessions, linked accounts, user.
    const ctx = await auth.$context;
    await ctx.internalAdapter.deleteUserSessions(uid);
    await ctx.internalAdapter.deleteAccounts(uid);
    await ctx.internalAdapter.deleteUser(uid);
  } catch (e) {
    console.error("[deleteAccount]", e instanceof Error ? e.message : e);
    return fail("We couldn't delete your account. Please contact support.");
  }

  // Clear this browser's session cookie.
  await auth.api.signOut({ headers: await headers() }).catch(() => undefined);
  redirect("/?account_deleted=1");
}
