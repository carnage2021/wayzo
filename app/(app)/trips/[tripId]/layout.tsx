import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripBottomNav, TripMobileHeader } from "@/components/trip/trip-mobile-nav";
import { TripSidebar } from "@/components/trip/trip-sidebar";
import { getProfile, requireUser } from "@/lib/auth";
import { getTrip } from "@/lib/trips/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripId: string }>;
}): Promise<Metadata> {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  return { title: trip?.name ?? "Trip" };
}

/** Trip shell: dark sidebar (desktop) / top bar + bottom nav (mobile), light content. */
export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const user = await requireUser(`/trips/${tripId}`);
  const [trip, profile] = await Promise.all([getTrip(tripId), getProfile(user.id)]);
  if (!trip) notFound(); // also covers non-members (RLS returns nothing)

  return (
    <div className="flex min-h-dvh">
      <TripSidebar
        tripId={trip.id}
        tripName={trip.name}
        me={{ id: user.id, name: profile?.name ?? user.email ?? null, avatar_url: profile?.avatar_url }}
        email={user.email ?? ""}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TripMobileHeader tripName={trip.name} />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          {children}
        </main>
      </div>
      <TripBottomNav tripId={trip.id} />
    </div>
  );
}
