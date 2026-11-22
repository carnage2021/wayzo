import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ticket } from "lucide-react";
import { BookingCard } from "@/components/bookings/booking-card";
import { shortDate } from "@/components/bookings/booking-meta";
import { TicketUploader } from "@/components/bookings/ticket-uploader";
import { ForwardingAddress } from "@/components/trip/forwarding-address";
import { PageHeader } from "@/components/trip/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { inboundAddress } from "@/lib/env";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { toBooking } from "@/lib/db/rows";
import { bookings as bookingsTable } from "@/lib/db/schema";
import type { BookingRow } from "@/lib/db/types";
import { tripDay } from "@/lib/tickets/logic";
import { getTrip } from "@/lib/trips/queries";

export const metadata: Metadata = { title: "Bookings" };
// Ticket reading on free models can take up to a minute; actions on this page inherit this.
export const maxDuration = 60;

function sortKey(b: BookingRow) {
  return `${b.start_at ?? "9999"}|${b.start_utc ?? ""}|${b.created_at}`;
}

export default async function BookingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const user = await requireUser(`/trips/${tripId}/bookings`);
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  const bookings = (
    await db()
      .select()
      .from(bookingsTable)
      .where(and(eq(bookingsTable.tripId, trip.id), ne(bookingsTable.status, "discarded")))
  )
    .map(toBooking)
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

  const people = new Map(trip.members.map((m) => [m.user_id, m.profile]));
  const toReview = bookings.filter((b) => b.status === "needs_review");
  const confirmed = bookings.filter((b) => b.status === "confirmed");

  // Timeline: group confirmed bookings by start date; undated ones last.
  const groups = new Map<string, BookingRow[]>();
  for (const b of confirmed) {
    const k = b.start_at?.slice(0, 10) ?? "undated";
    groups.set(k, [...(groups.get(k) ?? []), b]);
  }
  const isOwner = trip.owner_id === user.id;
  const address = inboundAddress(trip.inbound_code);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Trip"
        title="Bookings"
        description="Every flight, train, stay and table, read from your tickets and laid out day by day."
      />

      <Card className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>Add tickets</CardTitle>
          <Tag variant="blue">AI reads them for you</Tag>
        </div>
        <TicketUploader tripId={trip.id} isOwner={isOwner} />
        <ForwardingAddress address={address} />
      </Card>

      {toReview.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="review-h">
          <h2 id="review-h" className="font-display text-[24px] font-extrabold">
            Needs a quick check <span className="text-subtle text-lg">({toReview.length})</span>
          </h2>
          {toReview.map((b) => (
            <BookingCard
              key={b.id}
              tripId={trip.id}
              booking={b}
              addedBy={b.added_by ? (people.get(b.added_by) ?? null) : null}
            />
          ))}
        </section>
      )}

      {confirmed.length === 0 && toReview.length === 0 ? (
        <EmptyState
          icon={<Ticket />}
          title="No bookings yet"
          description="Upload a flight, train, hotel or restaurant confirmation. We'll read it and place it on the right day."
        />
      ) : (
        <section className="flex flex-col gap-7" aria-label="Timeline">
          {[...groups.entries()].map(([date, items]) => {
            const day = date === "undated" ? null : tripDay(trip.start_date, trip.end_date, date);
            return (
              <div key={date} className="flex flex-col gap-3">
                <h2 className="flex items-baseline gap-3">
                  {day && (
                    <span className="bg-ink text-lime rounded-full px-3 py-1 text-xs font-bold">
                      Day {day}
                    </span>
                  )}
                  <span className="font-display text-[22px] font-extrabold">
                    {date === "undated" ? "No date yet" : shortDate(date)}
                  </span>
                  {date !== "undated" && !day && trip.start_date && (
                    <span className="text-subtle text-sm">outside trip dates</span>
                  )}
                </h2>
                {items.map((b) => (
                  <BookingCard
                    key={b.id}
                    tripId={trip.id}
                    booking={b}
                    addedBy={b.added_by ? (people.get(b.added_by) ?? null) : null}
                  />
                ))}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
