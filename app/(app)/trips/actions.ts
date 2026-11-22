"use server";

import { randomInt, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { activity, tripMembers, trips } from "@/lib/db/schema";
import type { CoverCredit, Destination, JsonValue } from "@/lib/db/types";
import { findCoverPhoto } from "@/lib/places/cover";
import { getPlaceBasics, isPlacesConfigured } from "@/lib/places/geoapify";
import { memberAccess } from "@/lib/trips/access";
import { deleteTripFiles } from "@/lib/uploads";
import { fieldErrors, tripInputSchema, type TripInput } from "@/lib/validation/schemas";

type FieldResult<T> = ActionResult<T> & { fields?: Record<string, string> };

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
    coverUrl: cover?.url ?? null,
    coverCredit: (cover?.credit ?? null) as CoverCredit | null,
  };
}

async function logActivity(tripId: string, actorId: string, verb: string, object: JsonValue = {}) {
  await db().insert(activity).values({ tripId, actorId, verb, object });
}

/** Postgres unique violation (e.g. the random inbound code already exists). */
function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

export async function createTrip(raw: unknown): Promise<FieldResult<{ id: string }>> {
  const user = await getUser();
  if (!user) return fail("Please sign in again.");

  const parsed = tripInputSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };

  const resolved = await resolveDestinations(parsed.data.destinations);
  const id = randomUUID();

  // The forwarding code must be unique: retry with a new one if it collides.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await db().batch([
        db().insert(trips).values({
          id,
          ownerId: user.id,
          name: parsed.data.name,
          destinations: resolved.destinations,
          startDate: parsed.data.start_date,
          endDate: parsed.data.end_date,
          currency: parsed.data.currency,
          coverUrl: resolved.coverUrl,
          coverCredit: resolved.coverCredit,
          inboundCode: inboundCode(),
        }),
        db().insert(tripMembers).values({ tripId: id, userId: user.id, role: "owner" }),
        db()
          .insert(activity)
          .values({
            tripId: id,
            actorId: user.id,
            verb: "created the trip",
            object: { name: parsed.data.name },
          }),
      ]);
      revalidatePath("/trips");
      return ok({ id });
    } catch (e) {
      if (!isUniqueViolation(e)) {
        console.error("[createTrip]", e instanceof Error ? e.message : e);
        break;
      }
    }
  }
  return fail("We couldn't create your trip. Please try again.");
}

export async function updateTrip(tripId: string, raw: unknown): Promise<FieldResult<{ id: string }>> {
  const access = await memberAccess(tripId);
  if (!access) return fail("Trip not found.");
  const { user, trip: existing } = access;
  if (existing.owner_id !== user.id) return fail("Only the trip owner can change trip details.");

  const parsed = tripInputSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };

  const sameDestinations =
    JSON.stringify(existing.destinations.map((d) => d.place_id ?? d.name)) ===
    JSON.stringify(parsed.data.destinations.map((d) => d.place_id ?? d.name));
  const resolved = sameDestinations
    ? {
        destinations: existing.destinations,
        coverUrl: existing.cover_url,
        coverCredit: existing.cover_credit,
      }
    : await resolveDestinations(parsed.data.destinations);

  try {
    await db()
      .update(trips)
      .set({
        name: parsed.data.name,
        startDate: parsed.data.start_date,
        endDate: parsed.data.end_date,
        currency: parsed.data.currency,
        destinations: resolved.destinations,
        coverUrl: resolved.coverUrl,
        coverCredit: resolved.coverCredit,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, tripId));
  } catch {
    return fail("We couldn't save your changes. Please try again.");
  }

  await logActivity(tripId, user.id, "updated trip details");
  revalidatePath(`/trips/${tripId}`, "layout");
  revalidatePath("/trips");
  return ok({ id: tripId });
}

export async function deleteTrip(tripId: string, confirmName: string): Promise<ActionResult<never>> {
  const access = await memberAccess(tripId);
  if (!access) return fail("Trip not found.");
  if (access.trip.owner_id !== access.user.id) return fail("Only the trip owner can delete this trip.");
  if (confirmName.trim() !== access.trip.name) return fail("Type the trip name exactly to confirm.");

  try {
    // Stored ticket files first; members, activity, bookings and uploads rows cascade with the trip.
    await deleteTripFiles([tripId]);
    await db().delete(trips).where(eq(trips.id, tripId));
  } catch (e) {
    console.error("[deleteTrip]", e instanceof Error ? e.message : e);
    return fail("We couldn't delete this trip. Please try again.");
  }

  revalidatePath("/trips");
  redirect("/trips?deleted=1");
}

export async function leaveTrip(tripId: string): Promise<ActionResult<never>> {
  const access = await memberAccess(tripId);
  if (!access) return fail("Trip not found.");
  if (access.trip.owner_id === access.user.id)
    return fail("Owners can't leave their own trip. Delete it instead.");

  try {
    await db().batch([
      db().insert(activity).values({ tripId, actorId: access.user.id, verb: "left the trip", object: {} }),
      db()
        .delete(tripMembers)
        .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, access.user.id))),
    ]);
  } catch {
    return fail("We couldn't remove you from this trip.");
  }
  revalidatePath("/trips");
  redirect("/trips");
}
