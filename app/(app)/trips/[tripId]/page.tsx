import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import {
  ActivityCard,
  BudgetCard,
  ChecklistCard,
  MembersCard,
  QuickUploadCard,
  StayCoverageCard,
  TodayCard,
  type ActivityEntry,
  type ChecklistItem,
} from "@/components/trip/dashboard-cards";
import { TripCover } from "@/components/trip/trip-cover";
import { AvatarStack } from "@/components/ui/avatar";
import { getProfile, requireUser } from "@/lib/auth";
import { inboundAddress } from "@/lib/env";
import { db } from "@/lib/firebase/admin";
import { toActivity, toIso } from "@/lib/firebase/convert";
import { stayCoverage } from "@/lib/trips/coverage";
import { countdownLabel, formatTripRange, todayIn, tripDayNumber, tripPhase } from "@/lib/trips/dates";
import { getTrip } from "@/lib/trips/queries";

export default async function TripDashboardPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const user = await requireUser(`/trips/${tripId}`);
  const [trip, profile] = await Promise.all([getTrip(tripId), getProfile(user.id)]);
  if (!trip) notFound();

  // getTrip() already confirmed membership; these subcollections belong to that trip.
  const tripRef = db().collection("trips").doc(trip.id);
  const [bookingsSnap, prefsSnap, expensesSnap, activitySnap] = await Promise.all([
    tripRef.collection("bookings").select("type", "status", "start_at", "end_at").get(),
    tripRef.collection("preferences").doc(user.id).get(),
    tripRef.collection("expenses").select("amount_trip_minor").get(),
    tripRef.collection("activity").orderBy("created_at", "desc").limit(6).get(),
  ]);

  const bookings = bookingsSnap.docs
    .map((d) => ({
      type: d.get("type") as string,
      status: d.get("status") as string,
      start_at: toIso(d.get("start_at")),
      end_at: toIso(d.get("end_at")),
    }))
    .filter((b) => b.status !== "discarded");
  const stays = bookings.filter((b) => b.type === "stay");
  const coverage = stayCoverage(trip.start_date, trip.end_date, stays);
  const spent = expensesSnap.docs.reduce((sum, d) => sum + (Number(d.get("amount_trip_minor")) || 0), 0);

  const people = new Map(trip.members.map((m) => [m.user_id, m.profile]));
  const activity: ActivityEntry[] = activitySnap.docs.map((d) => {
    const a = toActivity(d, trip.id);
    return {
      id: a.id,
      verb: a.verb,
      created_at: a.created_at,
      actor: a.actor_id ? (people.get(a.actor_id) ?? null) : null,
    };
  });

  const today = todayIn(profile?.timezone ?? undefined);
  const phase = tripPhase(trip.start_date, trip.end_date, today);
  const day = tripDayNumber(trip.start_date, trip.end_date, today);

  const checklist: ChecklistItem[] = [
    {
      label: "Upload tickets",
      hint: "Flights, trains, stays and tables",
      done: bookings.length > 0,
      href: `/trips/${trip.id}/bookings`,
    },
    {
      label: "Invite your group",
      hint: "Everyone sees the same trip",
      done: trip.members.length > 1,
      href: `/trips/${trip.id}/members`,
    },
    {
      label: "Take the quiz",
      hint: "Budget, food, pace, in under a minute",
      done: prefsSnap.exists,
      href: `/trips/${trip.id}/plan`,
      soon: true,
    },
    {
      label: "Pick a stay",
      hint: coverage.total ? `${coverage.covered}/${coverage.total} nights covered` : "Add dates to see gaps",
      done: coverage.total > 0 && coverage.gaps === 0,
      href: `/trips/${trip.id}/stays`,
      soon: true,
    },
  ];

  const firstName = profile?.name?.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <TripCover
        coverUrl={trip.cover_url}
        credit={trip.cover_credit}
        linkCredit
        creditPosition="top"
        label=""
        className="flex min-h-[220px] flex-col justify-end rounded-[32px] p-6 text-white sm:min-h-[260px] sm:p-8"
      >
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <span className="bg-lime text-ink inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold">
              {phase === "ongoing" && <span className="animate-pulse-lime bg-ink size-1.5 rounded-full" />}
              {countdownLabel(trip.start_date, trip.end_date, today)}
            </span>
            <h1 className="font-display mt-3 text-[clamp(32px,4.4vw,52px)] leading-[1.02] font-extrabold break-words">
              {trip.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[15px] text-white/80">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" aria-hidden />
                {formatTripRange(trip.start_date, trip.end_date)}
              </span>
              {trip.destinations.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden />
                  {trip.destinations.map((d) => d.name).join(" · ")}
                </span>
              )}
            </div>
          </div>
          <AvatarStack
            people={trip.members.map((m) => m.profile)}
            max={4}
            size={36}
            ringClassName="border-ink"
          />
        </div>
      </TripCover>

      {firstName && phase === "upcoming" && (
        <p className="text-subtle text-[15px]">
          Welcome back, <span className="text-ink font-semibold">{firstName}</span>. Here&apos;s where your
          trip stands.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          {phase === "ongoing" && day ? (
            <TodayCard day={day} tripId={trip.id} />
          ) : phase === "upcoming" ? (
            <ChecklistCard items={checklist} />
          ) : null}
          <QuickUploadCard forwardingAddress={inboundAddress(trip.inbound_code)} />
        </div>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <BudgetCard
              spentMinor={spent}
              plannedMinor={trip.planned_budget_minor}
              currency={trip.currency}
            />
            <StayCoverageCard covered={coverage.covered} total={coverage.total} tripId={trip.id} />
          </div>
          <MembersCard members={trip.members} tripId={trip.id} />
          <ActivityCard entries={activity} />
        </div>
      </div>
    </div>
  );
}
