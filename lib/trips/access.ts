import "server-only";
import { and, eq } from "drizzle-orm";
import { getUser, type SessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toTrip } from "@/lib/db/rows";
import { tripMembers, trips } from "@/lib/db/schema";
import type { TripRole, TripRow } from "@/lib/db/types";
import { UUID_RE } from "./queries";

/** Signed-in user + trip + their role, only when the user is a member. Used by route handlers and actions. */
export async function memberAccess(
  tripId: string,
): Promise<{ user: SessionUser; trip: TripRow; role: TripRole } | null> {
  if (!UUID_RE.test(tripId)) return null;
  const user = await getUser();
  if (!user) return null;
  const [row] = await db()
    .select({ trip: trips, role: tripMembers.role })
    .from(trips)
    .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, user.id)))
    .where(eq(trips.id, tripId))
    .limit(1);
  if (!row) return null;
  return { user, trip: toTrip(row.trip, [user.id]), role: row.role };
}

export const BOOKING_ID_RE = UUID_RE;
