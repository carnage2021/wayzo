import {
  BedDouble,
  CalendarDays,
  Images,
  LayoutGrid,
  Settings,
  Ticket,
  Users,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type TripSection = {
  /** URL segment after /trips/[id]; "" = dashboard */
  slug: string;
  label: string;
  Icon: LucideIcon;
  /** Roadmap phase where the module ships (for "coming soon" states). */
  phase: number;
  blurb: string;
};

export const TRIP_SECTIONS: TripSection[] = [
  { slug: "", label: "Dashboard", Icon: LayoutGrid, phase: 1, blurb: "" },
  {
    slug: "bookings",
    label: "Bookings",
    Icon: Ticket,
    phase: 2,
    blurb: "Every flight, train, stay and table, read from your tickets and laid out day by day.",
  },
  {
    slug: "plan",
    label: "Plan",
    Icon: CalendarDays,
    phase: 3,
    blurb: "A day-by-day plan built around your bookings. Drag, drop, or ask the AI to add a spot.",
  },
  {
    slug: "stays",
    label: "Stays",
    Icon: BedDouble,
    phase: 3,
    blurb: "Stays matched to your group's budget and style for every night that still needs a bed.",
  },
  {
    slug: "food",
    label: "Food",
    Icon: UtensilsCrossed,
    phase: 3,
    blurb: "Breakfast, lunch, dinner and bars near each day's plan, filtered for your group's diets.",
  },
  {
    slug: "expenses",
    label: "Expenses",
    Icon: Wallet,
    phase: 4,
    blurb: "Add an expense in two taps, split it any way, and always know who owes whom.",
  },
  {
    slug: "album",
    label: "Album",
    Icon: Images,
    phase: 5,
    blurb: "A shared album for the whole group that turns into a trip story you can post.",
  },
  { slug: "members", label: "Members", Icon: Users, phase: 1, blurb: "" },
  { slug: "settings", label: "Settings", Icon: Settings, phase: 1, blurb: "" },
];

/** Sections up to this roadmap phase are live; later ones show "Soon". */
export const LIVE_PHASE = 2;

export const MOBILE_PRIMARY = ["", "bookings", "plan", "expenses"];

export function sectionHref(tripId: string, slug: string) {
  return slug ? `/trips/${tripId}/${slug}` : `/trips/${tripId}`;
}
