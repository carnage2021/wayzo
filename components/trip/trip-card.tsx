import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { AvatarStack } from "@/components/ui/avatar";
import { countdownLabel, formatTripRange, tripPhase } from "@/lib/trips/dates";
import type { TripWithMembers } from "@/lib/trips/queries";
import { cn } from "@/lib/utils";
import { TripCover } from "./trip-cover";

export function TripCard({ trip, today }: { trip: TripWithMembers; today: string }) {
  const phase = tripPhase(trip.start_date, trip.end_date, today);
  const places = trip.destinations.map((d) => d.name).join(" · ");
  const coverLabel = trip.destinations[0]?.name ?? trip.name;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group lift border-soft-line focus-visible:ring-blue/30 flex flex-col overflow-hidden rounded-[28px] border bg-white outline-none focus-visible:ring-4"
    >
      <TripCover coverUrl={trip.cover_url} credit={trip.cover_credit} label={coverLabel} className="h-40">
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
            phase === "ongoing" ? "bg-lime text-ink" : "text-ink bg-white/95",
          )}
        >
          {phase === "ongoing" && <span className="animate-pulse-lime bg-ink size-1.5 rounded-full" />}
          {countdownLabel(trip.start_date, trip.end_date, today)}
        </span>
      </TripCover>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display group-hover:text-blue truncate text-[22px] leading-tight font-extrabold">
            {trip.name}
          </h3>
          <div className="text-subtle mt-2 flex flex-col gap-1 text-sm">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden />
              {formatTripRange(trip.start_date, trip.end_date)}
            </span>
            {places && (
              <span className="inline-flex min-w-0 items-center gap-2">
                <MapPin className="size-4 shrink-0" aria-hidden />
                <span className="truncate">{places}</span>
              </span>
            )}
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-1">
          <AvatarStack people={trip.members.map((m) => m.profile)} max={4} size={30} />
          <span className="text-subtle text-[13px] font-semibold">
            {trip.members.length} {trip.members.length === 1 ? "traveller" : "travellers"}
          </span>
        </div>
      </div>
    </Link>
  );
}
