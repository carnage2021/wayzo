"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TripPhase } from "@/lib/trips/dates";

const LABELS: Record<TripPhase, string> = { upcoming: "Upcoming", ongoing: "Ongoing", past: "Past" };

/** Client tabs over server-rendered panels (keeps cards as server components). */
export function TripsTabs({
  counts,
  defaultTab,
  panels,
}: {
  counts: Record<TripPhase, number>;
  defaultTab: TripPhase;
  panels: Record<TripPhase, React.ReactNode>;
}) {
  return (
    <Tabs defaultValue={defaultTab} className="flex flex-col gap-8">
      <TabsList aria-label="Trips by status" className="self-start">
        {(Object.keys(LABELS) as TripPhase[]).map((k) => (
          <TabsTrigger key={k} value={k}>
            {LABELS[k]}
            <span className="rounded-full bg-black/[.06] px-2 py-0.5 text-xs tabular-nums in-data-[state=active]:bg-white/15">
              {counts[k]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {(Object.keys(LABELS) as TripPhase[]).map((k) => (
        <TabsContent key={k} value={k}>
          {panels[k]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
