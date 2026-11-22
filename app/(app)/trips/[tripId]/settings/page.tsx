import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { DangerZone } from "@/components/trip/danger-zone";
import { PageHeader } from "@/components/trip/page-header";
import { TripForm } from "@/components/trip/trip-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getTrip } from "@/lib/trips/queries";

export default async function TripSettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const user = await requireUser(`/trips/${tripId}/settings`);
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const isOwner = trip.members.some((m) => m.user_id === user.id && m.role === "owner");

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader eyebrow="Trip" title="Settings" description="Trip details, currency and membership." />

      <Card size="lg">
        <CardTitle className="text-[22px]">Trip details</CardTitle>
        {isOwner ? (
          <TripForm
            mode="edit"
            tripId={trip.id}
            initial={{
              name: trip.name,
              destinations: trip.destinations,
              start_date: trip.start_date ?? "",
              end_date: trip.end_date ?? "",
              currency: trip.currency,
            }}
          />
        ) : (
          <div className="bg-mist flex items-start gap-3 rounded-[18px] p-4">
            <Lock className="text-subtle mt-0.5 size-5 shrink-0" aria-hidden />
            <CardDescription>
              Only the trip owner can change the name, dates, destinations or currency.
            </CardDescription>
          </div>
        )}
      </Card>

      <DangerZone tripId={trip.id} tripName={trip.name} isOwner={isOwner} />
    </div>
  );
}
