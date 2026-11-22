"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { db } from "@/lib/db";
import { activity, bookings, trips } from "@/lib/db/schema";
import { bookingTitle, dedupeKey, isTimeZone, localToUtc, toMinor } from "@/lib/tickets/logic";
import { BOOKING_ID_RE, memberAccess } from "@/lib/trips/access";
import { bookingEditSchema } from "@/lib/validation/booking";
import { fieldErrors } from "@/lib/validation/schemas";

type FieldResult<T> = ActionResult<T> & { fields?: Record<string, string> };

/** The booking, only when the current user is a member of its trip. */
async function findBooking(tripId: string, bookingId: string) {
  const access = await memberAccess(tripId);
  if (!access || !BOOKING_ID_RE.test(bookingId)) return null;
  const [booking] = await db()
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), eq(bookings.tripId, tripId)))
    .limit(1);
  return booking ? { ...access, booking } : null;
}

function revalidate(tripId: string) {
  revalidatePath(`/trips/${tripId}`, "layout");
}

/** Save edits from the review screen and mark the booking confirmed. */
export async function confirmBooking(
  tripId: string,
  bookingId: string,
  raw: unknown,
): Promise<FieldResult<null>> {
  const found = await findBooking(tripId, bookingId);
  if (!found) return fail("Booking not found.");
  const parsed = bookingEditSchema.safeParse(raw);
  if (!parsed.success) return { ...fail("Check the highlighted fields."), fields: fieldErrors(parsed.error) };
  const e = parsed.data;
  const zone = isTimeZone(found.booking.timezone) ? found.booking.timezone : null;
  const title = bookingTitle({
    type: e.type,
    provider: e.provider,
    from_place: e.from_place,
    to_place: e.to_place,
  });

  await db().batch([
    db()
      .update(bookings)
      .set({
        type: e.type,
        provider: e.provider,
        bookingCode: e.booking_code,
        startAt: e.start_at,
        endAt: e.end_at,
        fromPlace: e.from_place,
        toPlace: e.to_place,
        address: e.address,
        seatOrRoom: e.seat_or_room,
        priceMinor: toMinor(e.price, e.currency),
        currency: e.currency,
        notes: e.notes,
        startUtc: e.start_at ? localToUtc(e.start_at, zone) : null,
        endUtc: e.end_at ? localToUtc(e.end_at, zone) : null,
        dedupeKey: dedupeKey(e),
        status: "confirmed",
        confirmedBy: found.user.id,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId)),
    db()
      .insert(activity)
      .values({ tripId, actorId: found.user.id, verb: `confirmed ${title}`, object: { booking: bookingId } }),
  ]);
  revalidate(tripId);
  return ok(null);
}

/** Keep the booking out of the trip (kept for the record, hidden from timeline and totals). */
export async function discardBooking(tripId: string, bookingId: string): Promise<ActionResult<null>> {
  const found = await findBooking(tripId, bookingId);
  if (!found) return fail("Booking not found.");
  await db()
    .update(bookings)
    .set({ status: "discarded", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));
  revalidate(tripId);
  return ok(null);
}

/** Delete a booking (also used by the 10-second Undo after upload). */
export async function deleteBooking(tripId: string, bookingId: string): Promise<ActionResult<null>> {
  const found = await findBooking(tripId, bookingId);
  if (!found) return fail("Booking not found.");
  await db().delete(bookings).where(eq(bookings.id, bookingId));
  revalidate(tripId);
  return ok(null);
}

/** "Extend trip to include this?" — owner only, dates can only widen. */
export async function extendTripDates(
  tripId: string,
  start: string,
  end: string,
): Promise<ActionResult<null>> {
  const access = await memberAccess(tripId);
  if (!access) return fail("Trip not found.");
  if (access.trip.owner_id !== access.user.id) return fail("Only the trip owner can change the dates.");
  const d = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
  if (!d.safeParse(start).success || !d.safeParse(end).success || end < start) return fail("Invalid dates.");
  const newStart = access.trip.start_date && access.trip.start_date < start ? access.trip.start_date : start;
  const newEnd = access.trip.end_date && access.trip.end_date > end ? access.trip.end_date : end;
  await db()
    .update(trips)
    .set({ startDate: newStart, endDate: newEnd, updatedAt: new Date() })
    .where(eq(trips.id, tripId));
  revalidate(tripId);
  revalidatePath("/trips");
  return ok(null);
}
