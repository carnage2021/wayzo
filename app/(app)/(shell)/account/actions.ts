"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { adminAuth, adminDb, db } from "@/lib/firebase/admin";
import { emailKey, toMember } from "@/lib/firebase/convert";
import { SESSION_COOKIE } from "@/lib/firebase/session";
import { sendEmail, verifyEmailEmail } from "@/lib/notifications/email";
import { createSignedToken } from "@/lib/signed-token";
import { emailSchema, fieldErrors, profileSchema, type ProfileInput } from "@/lib/validation/schemas";

type FieldResult<T> = ActionResult<T> & { fields?: Record<string, string> };

function profileFields(p: ProfileInput) {
  return {
    name: p.name,
    home_city: p.home_city || null,
    currency: p.currency,
    food_pref: p.food_pref ?? null,
    email_notifications: p.email_notifications,
    push_notifications: p.push_notifications,
  };
}

export async function updateProfile(raw: unknown): Promise<FieldResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };

  try {
    await db().collection("users").doc(user.id).set(profileFields(parsed.data), { merge: true });
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
  const base = { onboarded_at: FieldValue.serverTimestamp(), timezone: tz.success ? tz.data : null };

  let update: Record<string, unknown> = base;
  if (!skip) {
    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success)
      return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };
    update = { ...profileFields(parsed.data), ...base };
  }
  try {
    await db().collection("users").doc(user.id).set(update, { merge: true });
  } catch {
    return fail("We couldn't save your details. Please try again.");
  }

  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/trips";
  redirect(dest);
}

// ---------- Extra emails (F2): bookings forwarded from these are recognised ----------
// Stored at userEmails/{sha256(email)} so one email can belong to only one account.

const VERIFY_TTL_SECONDS = 60 * 60 * 24;
const ROW_ID_RE = /^[a-f0-9]{64}$/;

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

  const firestore = db();
  const mine = await firestore.collection("userEmails").where("user_id", "==", user.id).count().get();
  if (mine.data().count >= 5) return fail("You can add up to 5 emails.");

  const id = emailKey(parsed.data);
  const ref = firestore.collection("userEmails").doc(id);
  const result = await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      // Someone else's unverified claim expires with its link, so nobody can squat an address.
      const created = snap.get("created_at") as Timestamp | undefined;
      const stale =
        !snap.get("verified_at") &&
        snap.get("user_id") !== user.id &&
        created !== undefined &&
        Date.now() - created.toMillis() > VERIFY_TTL_SECONDS * 1000;
      if (!stale) return "taken" as const;
    }
    tx.set(ref, {
      user_id: user.id,
      email: parsed.data,
      primary: false,
      verified_at: null,
      created_at: FieldValue.serverTimestamp(),
    });
    return "ok" as const;
  });
  if (result === "taken") return fail("That email is already linked to an account.");

  await sendVerification(user.id, id, parsed.data);
  revalidatePath("/account");
  return ok(null);
}

export async function resendVerification(rowId: string): Promise<ActionResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  if (!ROW_ID_RE.test(rowId)) return fail("Email not found.");
  const snap = await db().collection("userEmails").doc(rowId).get();
  if (!snap.exists || snap.get("user_id") !== user.id) return fail("Email not found.");
  if (snap.get("verified_at")) return fail("That email is already verified.");
  await sendVerification(user.id, rowId, snap.get("email") as string);
  return ok(null);
}

export async function removeEmail(rowId: string): Promise<ActionResult<null>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  if (!ROW_ID_RE.test(rowId)) return fail("We couldn't remove that email.");
  const firestore = db();
  const ref = firestore.collection("userEmails").doc(rowId);
  const removed = await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("user_id") !== user.id || snap.get("primary")) return false;
    tx.delete(ref);
    return true;
  });
  if (!removed) return fail("We couldn't remove that email.");
  revalidatePath("/account");
  return ok(null);
}

// ---------- Delete account (F2) ----------

export async function deleteAccount(confirmation: string): Promise<ActionResult<never>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  if (confirmation.trim() !== "DELETE") return fail('Type "DELETE" to confirm.');

  const firestore = adminDb();
  const auth = adminAuth();
  if (!firestore || !auth) return fail("Account deletion isn't configured on this server yet.");
  const uid = user.id;

  try {
    const trips = await firestore.collection("trips").where("member_ids", "array-contains", uid).get();
    for (const tripSnap of trips.docs) {
      const tripRef = tripSnap.ref;
      const batch = firestore.batch();
      const tripUpdate: Record<string, unknown> = { member_ids: FieldValue.arrayRemove(uid) };
      if (tripSnap.get("owner_id") === uid) {
        // Hand over to the longest-standing member, or delete the trip if I'm alone.
        const members = await tripRef.collection("members").get();
        const heir = members.docs
          .map((d) => toMember(d, tripRef.id))
          .filter((m) => m.user_id !== uid)
          .sort((a, b) => a.joined_at.localeCompare(b.joined_at))[0];
        if (!heir) {
          await firestore.recursiveDelete(tripRef);
          const code = tripSnap.get("inbound_code") as string | undefined;
          if (code) await firestore.collection("inboundCodes").doc(code).delete();
          continue;
        }
        tripUpdate.owner_id = heir.user_id;
        batch.update(tripRef.collection("members").doc(heir.user_id), { role: "owner" });
      }
      batch.update(tripRef, tripUpdate);
      batch.delete(tripRef.collection("members").doc(uid));
      await batch.commit();
    }

    const emails = await firestore.collection("userEmails").where("user_id", "==", uid).get();
    const batch = firestore.batch();
    emails.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(firestore.collection("users").doc(uid));
    await batch.commit();

    await auth.deleteUser(uid);
  } catch (e) {
    console.error("[deleteAccount]", e instanceof Error ? e.message : e);
    return fail("We couldn't delete your account. Please contact support.");
  }

  (await cookies()).delete(SESSION_COOKIE);
  redirect("/?account_deleted=1");
}
