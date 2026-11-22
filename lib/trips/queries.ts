import "server-only";
import { cache } from "react";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/firebase/admin";
import { toMember, toProfile, toTrip } from "@/lib/firebase/convert";
import type { ProfileRow, TripMemberRow, TripRow } from "@/lib/firebase/types";

export type MemberWithProfile = TripMemberRow & {
  profile: Pick<ProfileRow, "id" | "name" | "avatar_url">;
};
export type TripWithMembers = TripRow & { members: MemberWithProfile[] };

const TRIP_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/** Attach member docs + profiles. Callers must have checked access already. */
async function withMembers(trips: TripRow[]): Promise<TripWithMembers[]> {
  if (trips.length === 0) return [];
  const firestore = db();
  const memberSnaps = await Promise.all(
    trips.map((t) => firestore.collection("trips").doc(t.id).collection("members").get()),
  );
  const userIds = [...new Set(memberSnaps.flatMap((s) => s.docs.map((d) => d.id)))];
  const profileSnaps = userIds.length
    ? await firestore.getAll(...userIds.map((id) => firestore.collection("users").doc(id)))
    : [];
  const byId = new Map(
    profileSnaps
      .map((s) => toProfile(s))
      .filter((p): p is ProfileRow => p !== null)
      .map((p) => [p.id, { id: p.id, name: p.name, avatar_url: p.avatar_url }]),
  );

  return trips.map((t, i) => ({
    ...t,
    members: (memberSnaps[i]?.docs ?? [])
      .map((d) => toMember(d, t.id))
      .sort((a, b) => a.joined_at.localeCompare(b.joined_at))
      .map((m) => ({
        ...m,
        profile: byId.get(m.user_id) ?? { id: m.user_id, name: null, avatar_url: null },
      })),
  }));
}

/** Upcoming first by start date (undated last), then newest. */
function byStartDate(a: TripRow, b: TripRow): number {
  if (a.start_date && b.start_date && a.start_date !== b.start_date) {
    return a.start_date.localeCompare(b.start_date);
  }
  if (a.start_date && !b.start_date) return -1;
  if (!a.start_date && b.start_date) return 1;
  return b.created_at.localeCompare(a.created_at);
}

/** All trips the current user belongs to. */
export async function listMyTrips(): Promise<TripWithMembers[]> {
  const user = await getUser();
  if (!user) return [];
  const snap = await db().collection("trips").where("member_ids", "array-contains", user.id).get();
  const trips = snap.docs.map((d) => toTrip(d)).filter((t): t is TripRow => t !== null);
  return withMembers(trips.sort(byStartDate));
}

/**
 * One trip with members, or null if it doesn't exist OR the current user isn't a member
 * (non-members get the same 404 as a missing trip).
 */
export const getTrip = cache(async (tripId: string): Promise<TripWithMembers | null> => {
  if (!TRIP_ID_RE.test(tripId)) return null;
  const user = await getUser();
  if (!user) return null;
  const trip = toTrip(await db().collection("trips").doc(tripId).get());
  if (!trip || !trip.member_ids.includes(user.id)) return null;
  const [withM] = await withMembers([trip]);
  return withM ?? null;
});
