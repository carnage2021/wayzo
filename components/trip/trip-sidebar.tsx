"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UserMenu } from "@/components/app/user-menu";
import type { AvatarPerson } from "@/components/ui/avatar";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { TRIP_SECTIONS, sectionHref } from "./trip-nav-items";

export function useActiveSection(tripId: string) {
  const pathname = usePathname();
  const rest = pathname.replace(`/trips/${tripId}`, "").replace(/^\//, "");
  return rest.split("/")[0] ?? "";
}

/** Desktop sidebar — the dark rail from the hero dashboard, expanded with labels. */
export function TripSidebar({
  tripId,
  tripName,
  me,
  email,
}: {
  tripId: string;
  tripName: string;
  me: AvatarPerson;
  email: string;
}) {
  const active = useActiveSection(tripId);

  return (
    <aside className="bg-ink sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col gap-6 p-4 text-white lg:flex">
      <Link href="/trips" className="flex items-center gap-2.5 px-2 pt-2 text-white" aria-label="My trips">
        <LogoMark size={34} />
        <span className="font-display text-[23px] font-extrabold">wayzo</span>
      </Link>

      <div className="bg-ink-2 rounded-[18px] p-3">
        <Link
          href="/trips"
          className="text-muted-dark inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-white"
        >
          <ChevronLeft className="size-3.5" aria-hidden /> All trips
        </Link>
        <div className="font-display mt-1 truncate text-lg leading-tight font-bold" title={tripName}>
          {tripName}
        </div>
      </div>

      <nav aria-label="Trip" className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {TRIP_SECTIONS.map(({ slug, label, Icon, phase }) => {
          const isActive = active === slug;
          return (
            <Link
              key={slug || "dashboard"}
              href={sectionHref(tripId, slug)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] font-medium transition-colors duration-200",
                isActive
                  ? "bg-white/[.12] text-white"
                  : "text-muted-dark hover:bg-white/[.06] hover:text-white",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-[30px] items-center justify-center rounded-[9px] transition-colors",
                  isActive ? "bg-lime text-ink" : "text-[#7A8397] group-hover:text-white",
                )}
              >
                <Icon className="size-[17px]" strokeWidth={2} aria-hidden />
              </span>
              <span className="flex-1">{label}</span>
              {phase > 1 && (
                <span className="text-muted-dark rounded-full bg-white/[.06] px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[.08] pt-3">
        <UserMenu person={me} email={email} tone="dark" align="start" side="top" showName />
      </div>
    </aside>
  );
}
