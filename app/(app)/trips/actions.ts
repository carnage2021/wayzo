"use server";

import { randomInt } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import { toTrip } from "@/lib/firebase/convert";
import type { CoverCredit, Destination, JsonValue, TripRow } from "@/lib/firebase/types";
import { findCoverPhoto } from "@/lib/places/cover";
import { getPlaceBasics, isPlacesConfigured } from "@/lib/places/geoapify";
import { fieldErrors, tripInputSchema, type TripInput } from "@/lib/validation/schemas";

type FieldResult<T> = ActionResult<T> & { fields?: Record<string, string> };

const TRIP_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i

function inboundCode(length = 8): string {
  let s = "";
  for (let i = 0; i < length; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

/** Re-resolve destinations on the server so coordinates come from the places provider, not the client. */
async function resolveDestinations(input: TripInput["destinations"]) {
  const destinations: Destination[] = [];
  for (const d of input) {
    if (d.place_id && isPlacesConfigured()) {
      const basics = await getPlaceBasics(d.place_id).catch(() => null);
      if (basics) {
        destinations.push({ place_id: basics.place_id, name: d.name, lat: basics.lat, lng: basics.lng });
        continue;
      }
    }
    destinations.push({ place_id: null, name: d.name, lat: null, lng: null });
  }
  const cover = destinations[0] ? await findCoverPhoto(destinations[0].name) : null;
  return {
    destinations,
    cover_url: cover?.url ?? null,
    cover_credit: (cover?.credit ?? null) as CoverCredit | null,
  };
}

function activity(actorId: string, verb: string, object: JsonValue = {}) {
  return { actor_id: actorId, verb, object, created_at: FieldValue.serverTimestamp() };
}

async function logActivity(tripId: string, actorId: string, verb: string, object: JsonValue = {}) {
  await db()
    .collection("trips")
    .doc(tripId)
    .collection("activity")
    .add(activity(actorId, verb, object));
}

/** Loads a trip only if the user is a member (null otherwise). */
async function memberTrip(tripId: string, userId: string): Promise<TripRow | null> {
  if (!TRIP_ID_RE.test(tripId)) return null;
  const trip = toTrip(await db().collection("trips").doc(tripId).get());
  return trip && trip.member_ids.includes(userId) ? trip : null;
}

export async function createTrip(raw: unknown): Promise<FieldResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");

  const parsed = tripInputSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };

  const resolved = await resolveDestinations(parsed.data.destinations);
  const firestore = db();
  const tripRef = firestore.collection("trips").doc();

  // The forwarding code must be unique: create() fails if it's taken, so retry with a new one.
  for (let attempt = 0; attempt < 4; attempt++) {
    const code = inboundCode();
    const batch = firestore.batch();
    batch.create(firestore.collection("inboundCodes").doc(code), { trip_id: tripRef.id });
    batch.create(tripRef, {
      owner_id: user.id,
      member_ids: [user.id],
      name: parsed.data.name,
      destinations: resolved.destinations,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      currency: parsed.data.currency,
      cover_url: resolved.cover_url,
      cover_credit: resolved.cover_credit,
      inbound_code: code,
      status: "planning",
      planned_budget_minor: null,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    batch.create(tripRef.collection("members").doc(user.id), {
      role: "owner",
      email_enabled: true,
      push_enabled: true,
      joined_at: FieldValue.serverTimestamp(),
    });
    batch.create(
      tripRef.collection("activity").doc(),
      activity(user.id, "created the trip", { name: parsed.data.name }),
    );
    try {
      await batch.commit();
      revalidatePath("/trips");
      return ok({ id: tripRef.id });
    } catch (e) {
      const code6 = (e as { code?: number }).code === 6; // ALREADY_EXISTS
      if (!code6) {
        console.error("[createTrip]", e instanceof Error ? e.message : e);
        break;
      }
    }
  }
  return fail("We couldn't create your trip. Please try again.");
}

export async function updateTrip(tripId: string, raw: unknown): Promise<FieldResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  const existing = await memberTrip(tripId, user.id);
  if (!existing) return fail("Trip not found.");
  if (existing.owner_id !== user.id) return fail("Only the trip owner can change trip details.");

  const parsed = tripInputSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };

  const sameDestinations =
    JSON.stringify(existing.destinations.map((d) => d.place_id ?? d.name)) ===
    JSON.stringify(parsed.data.destinations.map((d) => d.place_id ?? d.name));
  const resolved = sameDestinations
    ? {
        destinations: existing.destinations,
        cover_url: existing.cover_url,
        cover_credit: existing.cover_credit,
      }
    : await resolveDestinations(parsed.data.destinations);

  try {
    await db().collection("trips").doc(tripId).update({
      name: parsed.data.name,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      currency: parsed.data.currency,
      destinations: resolved.destinations,
      cover_url: resolved.cover_url,
      cover_credit: resolved.cover_credit,
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch {
    return fail("We couldn't save your changes. Please try again.");
  }

  await logActivity(tripId, user.id, "updated trip details");
  revalidatePath(`/trips/${tripId}`, "layout");
  revalidatePath("/trips");
  return ok({ id: tripId });
}

export async function deleteTrip(tripId: string, confirmName: string): Promise<ActionResult<never>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  const trip = await memberTrip(tripId, user.id);
  if (!trip) return fail("Trip not found.");
  if (trip.owner_id !== user.id) return fail("Only the trip owner can delete this trip.");
  if (confirmName.trim() !== trip.name) return fail("Type the trip name exactly to confirm.");

  const firestore = db();
  try {
    // Deletes the trip and every subcollection (members, activity, bookings, expenses…).
    await firestore.recursiveDelete(firestore.collection("trips").doc(tripId));
    if (trip.inbound_code) await firestore.collection("inboundCodes").doc(trip.inbound_code).delete();
  } catch (e) {
    console.error("[deleteTrip]", e instanceof Error ? e.message : e);
    return fail("We couldn't delete this trip. Please try again.");
  }

  revalidatePath("/trips");
  redirect("/trips?deleted=1");
}

export async function leaveTrip(tripId: string): Promise<ActionResult<never>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");
  const trip = await memberTrip(tripId, user.id);
  if (!trip) return fail("Trip not found.");
  if (trip.owner_id === user.id) return fail("Owners can't leave their own trip. Delete it instead.");

  const firestore = db();
  const tripRef = firestore.collection("trips").doc(tripId);
  try {
    const batch = firestore.batch();
    batch.create(tripRef.collection("activity").doc(), activity(user.id, "left the trip"));
    batch.update(tripRef, { member_ids: FieldValue.arrayRemove(user.id) });
    batch.delete(tripRef.collection("members").doc(user.id));
    await batch.commit();
  } catch {
    return fail("We couldn't remove you from this trip.");
  }
  revalidatePath("/trips");
  redirect("/trips");
}
