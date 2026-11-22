"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { MOBILE_PRIMARY, LIVE_PHASE, TRIP_SECTIONS, sectionHref } from "./trip-nav-items";
import { useActiveSection } from "./trip-sidebar";

/** Mobile top bar (trip name) */
export function TripMobileHeader({ tripName }: { tripName: string }) {
  return (
    <header className="bg-ink/95 sticky top-0 z-30 flex h-[60px] items-center gap-3 border-b border-white/[.08] px-4 text-white backdrop-blur-xl lg:hidden">
      <Link
        href="/trips"
        className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10"
        aria-label="All trips"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </Link>
      <span className="font-display min-w-0 flex-1 truncate text-lg font-bold">{tripName}</span>
      <LogoMark size={30} />
    </header>
  );
}

/** Mobile bottom nav: 4 primary sections + "More" sheet. Respects the iOS home indicator. */
export function TripBottomNav({ tripId }: { tripId: string }) {
  const active = useActiveSection(tripId);
  const [open, setOpen] = useState(false);
  const primary = TRIP_SECTIONS.filter((s) => MOBILE_PRIMARY.includes(s.slug));
  const more = TRIP_SECTIONS.filter((s) => !MOBILE_PRIMARY.includes(s.slug));
  const moreActive = more.some((s) => s.slug === active);

  const itemCls = (on: boolean) =>
    cn(
      "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-colors",
      on ? "text-ink" : "text-subtle",
    );
  const iconCls = (on: boolean) =>
    cn("inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors", on && "bg-lime");

  return (
    <nav
      aria-label="Trip"
      className="border-soft-line fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 px-2 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md gap-1">
        {primary.map(({ slug, label, Icon }) => {
          const on = active === slug;
          return (
            <Link
              key={slug || "dashboard"}
              href={sectionHref(tripId, slug)}
              aria-current={on ? "page" : undefined}
              className={itemCls(on)}
            >
              <span className={iconCls(on)}>
                <Icon className="size-5" aria-hidden />
              </span>
              {label === "Dashboard" ? "Home" : label}
            </Link>
          );
        })}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={itemCls(moreActive)}>
            <span className={iconCls(moreActive)}>
              <MoreHorizontal className="size-5" aria-hidden />
            </span>
            More
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-[max(24px,env(safe-area-inset-bottom))]">
            <SheetTitle className="font-display text-2xl font-extrabold">More</SheetTitle>
            <SheetDescription className="sr-only">Other trip sections</SheetDescription>
            <div className="grid grid-cols-3 gap-3">
              {more.map(({ slug, label, Icon, phase }) => {
                const on = active === slug;
                return (
                  <Link
                    key={slug}
                    href={sectionHref(tripId, slug)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-[18px] p-4 text-sm font-semibold transition-colors",
                      on ? "bg-ink text-white" : "bg-mist text-ink hover:bg-[#E8EBF2]",
                    )}
                  >
                    <Icon className={cn("size-6", on && "text-lime")} aria-hidden />
                    {label}
                    {phase > LIVE_PHASE && (
                      <span
                        className="bg-blue absolute top-2 right-2 size-1.5 rounded-full"
                        aria-label="Coming soon"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
