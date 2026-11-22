import "server-only";
import { cache } from "react";
import { and, asc, eq, inArray } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toMember, toTrip } from "@/lib/db/rows";
import { profiles, tripMembers, trips } from "@/lib/db/schema";
import type { ProfileRow, TripMemberRow, TripRow } from "@/lib/db/types";

export type MemberWithProfile = TripMemberRow & {
  profile: Pick<ProfileRow, "id" | "name" | "avatar_url">;
};
export type TripWithMembers = TripRow & { members: MemberWithProfile[] };

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads trips with their members and member profiles (two queries). Callers must have checked access. */
async function withMembers(rows: (typeof trips.$inferSelect)[]): Promise<TripWithMembers[]> {
  if (rows.length === 0) return [];
  const members = await db()
    .select({ member: tripMembers, name: profiles.name, avatarUrl: profiles.avatarUrl })
    .from(tripMembers)
    .leftJoin(profiles, eq(profiles.id, tripMembers.userId))
    .where(
      inArray(
        tripMembers.tripId,
        rows.map((t) => t.id),
      ),
    )
    .orderBy(asc(tripMembers.joinedAt));

  return rows.map((t) => {
    const mine = members.filter((m) => m.member.tripId === t.id);
    return {
      ...toTrip(
        t,
        mine.map((m) => m.member.userId),
      ),
      members: mine.map((m) => ({
        ...toMember(m.member),
        profile: { id: m.member.userId, name: m.name ?? null, avatar_url: m.avatarUrl ?? null },
      })),
    };
  });
}

/** Upcoming first by start date (undated last), then newest. */
function byStartDate(a: TripRow, b: TripRow): number {
  if (a.start_date && b.start_date && a.start_date !== b.start_date)
    return a.start_date.localeCompare(b.start_date);
  if (a.start_date && !b.start_date) return -1;
  if (!a.start_date && b.start_date) return 1;
  return b.created_at.localeCompare(a.created_at);
}

/** All trips the current user belongs to. */
export async function listMyTrips(): Promise<TripWithMembers[]> {
  const user = await getUser();
  if (!user) return [];
  const rows = await db()
    .select({ trip: trips })
    .from(trips)
    .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, user.id)));
  const list = await withMembers(rows.map((r) => r.trip));
  return list.sort(byStartDate);
}

/**
 * One trip with members, or null if it doesn't exist OR the current user isn't a member
 * (non-members get the same 404 as a missing trip).
 */
export const getTrip = cache(async (tripId: string): Promise<TripWithMembers | null> => {
  if (!UUID_RE.test(tripId)) return null;
  const user = await getUser();
  if (!user) return null;
  const rows = await db()
    .select({ trip: trips })
    .from(trips)
    .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, user.id)))
    .where(eq(trips.id, tripId))
    .limit(1);
  if (!rows[0]) return null;
  const [trip] = await withMembers([rows[0].trip]);
  return trip ?? null;
});
