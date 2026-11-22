import "server-only";
import type { activity, bookings, profiles, tripMembers, trips, userEmails } from "./schema";
import type {
  ActivityRow,
  BookingRow,
  BookingType,
  ProfileRow,
  TripMemberRow,
  TripRow,
  UserEmailRow,
} from "./types";

/** Drizzle rows (camelCase, Date) -> app rows (snake_case, ISO strings). */
const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);

export function toProfile(p: typeof profiles.$inferSelect): ProfileRow {
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    avatar_url: p.avatarUrl,
    home_city: p.homeCity,
    currency: p.currency,
    food_pref: p.foodPref,
    timezone: p.timezone,
    is_admin: p.isAdmin,
    onboarded_at: iso(p.onboardedAt),
    email_notifications: p.emailNotifications,
    push_notifications: p.pushNotifications,
    created_at: iso(p.createdAt)!,
  };
}

export function toUserEmail(e: typeof userEmails.$inferSelect): UserEmailRow {
  return {
    id: e.id,
    user_id: e.userId,
    email: e.email,
    primary: e.primary,
    verified_at: iso(e.verifiedAt),
    created_at: iso(e.createdAt)!,
  };
}

export function toTrip(t: typeof trips.$inferSelect, memberIds: string[]): TripRow {
  return {
    id: t.id,
    owner_id: t.ownerId,
    member_ids: memberIds,
    name: t.name,
    destinations: t.destinations ?? [],
    start_date: t.startDate,
    end_date: t.endDate,
    currency: t.currency,
    cover_url: t.coverUrl,
    cover_credit: t.coverCredit ?? null,
    inbound_code: t.inboundCode,
    status: t.status,
    planned_budget_minor: t.plannedBudgetMinor,
    created_at: iso(t.createdAt)!,
    updated_at: iso(t.updatedAt)!,
  };
}

export function toMember(m: typeof tripMembers.$inferSelect): TripMemberRow {
  return {
    trip_id: m.tripId,
    user_id: m.userId,
    role: m.role,
    email_enabled: m.emailEnabled,
    push_enabled: m.pushEnabled,
    joined_at: iso(m.joinedAt)!,
  };
}

export function toActivity(a: typeof activity.$inferSelect): ActivityRow {
  return {
    id: String(a.id),
    trip_id: a.tripId,
    actor_id: a.actorId,
    verb: a.verb,
    object: a.object ?? null,
    created_at: iso(a.createdAt)!,
  };
}

export function toBooking(b: typeof bookings.$inferSelect): BookingRow {
  return {
    id: b.id,
    trip_id: b.tripId,
    added_by: b.addedBy,
    source: b.source,
    source_key: b.sourceKey,
    source_name: b.sourceName,
    source_mime: b.sourceMime,
    type: b.type as BookingType,
    provider: b.provider,
    booking_code: b.bookingCode,
    travellers: b.travellers ?? [],
    start_at: b.startAt,
    end_at: b.endAt,
    start_utc: iso(b.startUtc),
    end_utc: iso(b.endUtc),
    timezone: b.timezone,
    from_place: b.fromPlace,
    to_place: b.toPlace,
    address: b.address,
    lat: b.lat,
    lng: b.lng,
    place_id: b.placeId,
    seat_or_room: b.seatOrRoom,
    price_minor: b.priceMinor,
    currency: b.currency,
    contact: b.contact,
    notes: b.notes,
    confidence: b.confidence ?? {},
    status: b.status,
    created_at: iso(b.createdAt)!,
    updated_at: iso(b.updatedAt)!,
  };
}
