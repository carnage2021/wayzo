import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, uploads } from "@/lib/db/schema";
import { BOOKING_ID_RE, memberAccess } from "@/lib/trips/access";

/** GET /api/trips/:tripId/bookings/:bookingId/source — members are sent to the original ticket file. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tripId: string; bookingId: string }> },
) {
  const { tripId, bookingId } = await params;
  const access = await memberAccess(tripId);
  if (!access || !BOOKING_ID_RE.test(bookingId)) return new NextResponse(null, { status: 404 });
  const [row] = await db()
    .select({ url: uploads.url })
    .from(bookings)
    .innerJoin(uploads, eq(uploads.key, bookings.sourceKey))
    .where(and(eq(bookings.id, bookingId), eq(bookings.tripId, tripId), eq(uploads.tripId, tripId)))
    .limit(1);
  if (!row) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(row.url, { status: 302, headers: { "Cache-Control": "private, no-store" } });
}
