import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plane, Plus } from "lucide-react";
import { FlashToast } from "@/components/app/flash-toast";
import { TripCard } from "@/components/trip/trip-card";
import { TripsTabs } from "@/components/trip/trips-tabs";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProfile, requireUser } from "@/lib/auth";
import { todayIn, tripPhase, type TripPhase } from "@/lib/trips/dates";
import { listMyTrips, type TripWithMembers } from "@/lib/trips/queries";

export const metadata: Metadata = { title: "My trips" };

const EMPTY_COPY: Record<TripPhase, { title: string; body: string }> = {
  upcoming: {
    title: "No upcoming trips",
    body: "Create a trip, then drop in your tickets. Wayzo does the rest.",
  },
  ongoing: { title: "Nothing happening right now", body: "Trips show up here while you're travelling." },
  past: { title: "No past trips yet", body: "Finished trips land here, ready to turn into a story." },
};

export default async function MyTripsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const user = await requireUser("/trips");
  const profile = await getProfile(user.id);
  if (profile && !profile.onboarded_at) redirect("/onboarding?next=/trips");

  const { deleted } = await searchParams;
  const trips = await listMyTrips();
  const today = todayIn(profile?.timezone ?? undefined);

  const groups: Record<TripPhase, TripWithMembers[]> = { upcoming: [], ongoing: [], past: [] };
  for (const t of trips) groups[tripPhase(t.start_date, t.end_date, today)].push(t);
  groups.past.reverse(); // most recent first

  const firstName = profile?.name?.split(" ")[0];
  const defaultTab: TripPhase = groups.ongoing.length ? "ongoing" : "upcoming";

  return (
    <div className="flex flex-col gap-10">
      {deleted && <FlashToast message="Trip deleted" />}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="eyebrow text-blue">{firstName ? `Hey ${firstName}` : "Your trips"}</div>
          <h1 className="font-display mt-3 text-[clamp(34px,4vw,48px)] leading-[1.02] font-extrabold">
            My trips
          </h1>
        </div>
        <Link href="/trips/new" className={buttonVariants({ variant: "ink" })}>
          <Plus className="size-5" aria-hidden /> New trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <EmptyState
          icon={<Plane />}
          title="Your first trip starts here"
          description="Give it a name and dates (or skip them). Then upload your tickets and invite your group."
          action={
            <Link href="/trips/new" className={buttonVariants({ variant: "lime" })}>
              <Plus className="size-5" aria-hidden /> Create a trip
            </Link>
          }
          className="py-20"
        />
      ) : (
        <TripsTabs
          defaultTab={defaultTab}
          counts={{
            upcoming: groups.upcoming.length,
            ongoing: groups.ongoing.length,
            past: groups.past.length,
          }}
          panels={{
            upcoming: <TripGrid trips={groups.upcoming} today={today} phase="upcoming" />,
            ongoing: <TripGrid trips={groups.ongoing} today={today} phase="ongoing" />,
            past: <TripGrid trips={groups.past} today={today} phase="past" />,
          }}
        />
      )}
    </div>
  );
}

function TripGrid({ trips, today, phase }: { trips: TripWithMembers[]; today: string; phase: TripPhase }) {
  if (trips.length === 0) {
    return <EmptyState title={EMPTY_COPY[phase].title} description={EMPTY_COPY[phase].body} />;
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((t) => (
        <TripCard key={t.id} trip={t} today={today} />
      ))}
    </div>
  );
}
