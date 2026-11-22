import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, inArray, ne } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { AiError } from "@/lib/ai/client";
import { parseTicket, type TripHint } from "@/lib/ai/parse-ticket";
import type { ParsedBooking } from "@/lib/ai/schemas";
import { recordAiUsage, reserveAiCall } from "@/lib/ai/usage";
import { db } from "@/lib/db";
import { activity, bookings, trips, uploads } from "@/lib/db/schema";
import type { Destination, TripRow } from "@/lib/db/types";
import { geocodePlace, isPlacesConfigured } from "@/lib/places/geoapify";
import { extractTicketContent, MAX_TICKET_BYTES } from "./extract";
import {
  bookingTitle,
  bookingsRange,
  dedupeKey,
  extensionNeeded,
  isTimeZone,
  isTransport,
  localToUtc,
  statusFor,
  toMinor,
  type DateRange,
} from "./logic";

export type ProcessedBooking = {
  id: string;
  title: string;
  type: string;
  status: "confirmed" | "needs_review";
};
export type ProcessResult =
  | {
      ok: true;
      notTravel: boolean;
      added: ProcessedBooking[];
      duplicates: string[];
      /** Range the trip would need to cover these bookings (offered to the owner). */
      extend: DateRange | null;
      /** Dates/destination were filled in from these tickets. */
      autofilled: boolean;
    }
  | { ok: false; error: string; code?: string };

const FRIENDLY: Record<string, string> = {
  cap_reached: "You've reached today's limit for reading tickets. Try again tomorrow.",
  not_configured: "Ticket reading isn't set up on this server yet.",
  unavailable: "Our ticket reader is busy right now. Please try again in a minute.",
  invalid_output: "We couldn't read this file. Try a clearer screenshot or the original PDF.",
};

/** Where on the map a booking happens: the stay/venue, or the arrival point for transport. */
function placeQuery(b: ParsedBooking): string | null {
  if (isTransport(b.type)) return b.to_place;
  return b.address ?? b.to_place ?? b.provider;
}

function tripHint(trip: TripRow): TripHint {
  return {
    name: trip.name,
    start_date: trip.start_date,
    end_date: trip.end_date,
    destinations: trip.destinations.map((d) => d.name),
  };
}

async function download(url: string): Promise<Uint8Array | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf.byteLength <= MAX_TICKET_BYTES + 1024 * 1024 ? buf : null;
  } catch {
    return null;
  }
}

/**
 * Reads one uploaded file and files its bookings into the trip.
 * `trip` must come from memberAccess() for `userId` (membership already checked);
 * the upload must have been made by that user to that trip.
 */
export async function processUpload(args: {
  trip: TripRow;
  userId: string;
  uploadKey: string;
  emailContext?: string;
}): Promise<ProcessResult> {
  const { trip, userId } = args;
  const [upload] = await db()
    .select()
    .from(uploads)
    .where(and(eq(uploads.key, args.uploadKey), eq(uploads.tripId, trip.id), eq(uploads.userId, userId)))
    .limit(1);
  if (!upload) return { ok: false, error: "We couldn't find the uploaded file. Please upload it again." };

  const bytes = await download(upload.url);
  if (!bytes) return { ok: false, error: "We couldn't open the uploaded file. Please upload it again." };

  // 1) Read the ticket.
  let parsed: ParsedBooking[];
  let isTravel: boolean;
  try {
    await reserveAiCall(userId, "parseTicket");
    const content = await extractTicketContent(bytes, upload.mime, upload.name);
    const r = await parseTicket(content, tripHint(trip), args.emailContext);
    void recordAiUsage(userId, r.usage, r.model);
    parsed = r.data.bookings;
    isTravel = r.data.is_travel_document;
  } catch (e) {
    const code = e instanceof AiError ? e.code : "unavailable";
    if (!(e instanceof AiError)) console.error("[tickets] parse failed", e);
    return { ok: false, error: FRIENDLY[code] ?? FRIENDLY.unavailable!, code };
  }
  if (!isTravel || parsed.length === 0) {
    return { ok: true, notTravel: true, added: [], duplicates: [], extend: null, autofilled: false };
  }

  // 2) Place + timezone for each booking (biased to the trip's first destination).
  const near = trip.destinations.find((d) => d.lat !== null && d.lng !== null);
  const geo = await Promise.all(
    parsed.map((b) => {
      const q = placeQuery(b);
      return q && isPlacesConfigured()
        ? geocodePlace(q, near ? { lat: near.lat!, lng: near.lng! } : null)
        : null;
    }),
  );

  // 3) Skip duplicates already in the trip (same provider + code + date).
  const keys = parsed.map((b) => dedupeKey(b));
  const lookups = [...new Set(keys.filter((k): k is string => Boolean(k)))];
  const existing = new Set(
    lookups.length
      ? (
          await db()
            .select({ key: bookings.dedupeKey })
            .from(bookings)
            .where(
              and(
                eq(bookings.tripId, trip.id),
                inArray(bookings.dedupeKey, lookups),
                ne(bookings.status, "discarded"),
              ),
            )
        ).map((r) => r.key)
      : [],
  );

  // 4) Build the rows.
  const added: ProcessedBooking[] = [];
  const duplicates: string[] = [];
  const kept: ParsedBooking[] = [];
  const rows: (typeof bookings.$inferInsert)[] = [];
  parsed.forEach((b, i) => {
    const key = keys[i] ?? null;
    const title = bookingTitle(b);
    if (key && existing.has(key)) {
      duplicates.push(title);
      return;
    }
    if (key) existing.add(key); // the same file listing a booking twice
    const g = geo[i];
    const timezone = isTimeZone(b.timezone) ? b.timezone : (g?.timezone ?? null);
    const start = b.start_at ? localToUtc(b.start_at, timezone) : null;
    const end = b.end_at
      ? localToUtc(b.end_at, isTransport(b.type) ? (g?.timezone ?? timezone) : timezone)
      : null;
    const status = statusFor(b);
    const id = randomUUID();
    rows.push({
      id,
      tripId: trip.id,
      addedBy: userId,
      source: args.emailContext ? "email" : "upload",
      sourceKey: upload.key,
      sourceName: upload.name,
      sourceMime: upload.mime,
      type: b.type,
      provider: b.provider,
      bookingCode: b.booking_code,
      travellers: b.travellers,
      startAt: b.start_at,
      endAt: b.end_at,
      startUtc: start,
      endUtc: end,
      timezone,
      fromPlace: b.from_place,
      toPlace: b.to_place,
      address: b.address,
      lat: g?.lat ?? null,
      lng: g?.lng ?? null,
      placeId: g?.place_id ?? null,
      seatOrRoom: b.seat_or_room,
      priceMinor: toMinor(b.price, b.currency),
      currency: b.currency,
      contact: b.contact,
      notes: b.notes,
      confidence: b.confidence,
      status,
      dedupeKey: key,
    });
    added.push({ id, title, type: b.type, status });
    kept.push(b);
  });

  // 5) A trip without dates/destination takes them from its first tickets.
  const tripUpdate: Partial<typeof trips.$inferInsert> = {};
  const range = bookingsRange(kept);
  if (!trip.start_date && range) {
    tripUpdate.startDate = range.start;
    tripUpdate.endDate = range.end;
  }
  if (trip.destinations.length === 0 && kept.length) {
    const stayIdx = kept.findIndex((b) => b.type === "stay");
    const g = geo[parsed.indexOf(kept[stayIdx >= 0 ? stayIdx : 0]!)];
    if (g) {
      const dest: Destination = { place_id: g.place_id, name: g.city ?? g.name, lat: g.lat, lng: g.lng };
      tripUpdate.destinations = [dest];
    }
  }
  const autofilled = Object.keys(tripUpdate).length > 0;

  const writes: BatchItem<"pg">[] = [];
  if (rows.length) {
    const verb = added.length === 1 ? `added ${added[0]!.title}` : `added ${added.length} bookings`;
    writes.push(db().insert(bookings).values(rows));
    writes.push(
      db()
        .insert(activity)
        .values({ tripId: trip.id, actorId: userId, verb, object: { bookings: added.map((a) => a.id) } }),
    );
  }
  if (autofilled) {
    writes.push(
      db()
        .update(trips)
        .set({ ...tripUpdate, updatedAt: new Date() })
        .where(eq(trips.id, trip.id)),
    );
  }
  // One transaction for the bookings, the activity entry and the trip auto-fill.
  if (writes.length) await db().batch(writes as [BatchItem<"pg">, ...BatchItem<"pg">[]]);

  return {
    ok: true,
    notTravel: false,
    added,
    duplicates,
    extend: autofilled ? null : extensionNeeded(trip, kept),
    autofilled,
  };
}
