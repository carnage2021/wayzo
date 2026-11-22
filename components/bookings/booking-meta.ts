import {
  BedDouble,
  Bus,
  CarFront,
  FileText,
  Plane,
  Sailboat,
  Ticket,
  TrainFront,
  UtensilsCrossed,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import type { BookingType } from "@/lib/db/types";

export const TYPE_ICON: Record<BookingType, LucideIcon> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
  ferry: Sailboat,
  stay: BedDouble,
  car_rental: CarFront,
  restaurant: UtensilsCrossed,
  activity: Ticket,
  event: PartyPopper,
  other: FileText,
};

/** Icon tile colours per type (light UI). */
export const TYPE_TONE: Record<BookingType, string> = {
  flight: "bg-[#EEF1FF] text-blue",
  train: "bg-[#E7F8EE] text-success",
  bus: "bg-[#E7F8EE] text-success",
  ferry: "bg-[#E6F4FB] text-[#0E6A8C]",
  stay: "bg-[#FFF1EC] text-[#B4441F]",
  car_rental: "bg-mist text-ink",
  restaurant: "bg-[#FFF4E5] text-[#B45309]",
  activity: "bg-[#F3EEFF] text-[#6B3FD4]",
  event: "bg-[#F3EEFF] text-[#6B3FD4]",
  other: "bg-mist text-muted",
};

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/** "Fri 12 Apr" for a YYYY-MM-DD date. */
export function shortDate(d: string): string {
  return dateFmt.format(new Date(`${d}T00:00:00Z`));
}

const time = (v: string | null) => (v && v.length > 10 ? v.slice(11, 16) : null);

/** "23:50 → 06:20 (+1)", "Check-in Fri 12 Apr · out Fri 16 Apr", "20:30". */
export function timeRange(type: BookingType, start: string | null, end: string | null): string {
  if (!start) return "Date to confirm";
  if (type === "stay" || type === "car_rental") {
    const a = shortDate(start.slice(0, 10)) + (time(start) ? ` ${time(start)}` : "");
    const b = end ? shortDate(end.slice(0, 10)) + (time(end) ? ` ${time(end)}` : "") : null;
    const [inLabel, outLabel] = type === "stay" ? ["Check-in", "check-out"] : ["Pick-up", "drop-off"];
    return b ? `${inLabel} ${a} · ${outLabel} ${b}` : `${inLabel} ${a}`;
  }
  const s = time(start);
  const e = time(end);
  if (!s) return "All day";
  if (!e) return s;
  const days =
    end && end.slice(0, 10) !== start.slice(0, 10)
      ? Math.round(
          (Date.parse(`${end.slice(0, 10)}T00:00:00Z`) - Date.parse(`${start.slice(0, 10)}T00:00:00Z`)) /
            86_400_000,
        )
      : 0;
  return `${s} → ${e}${days > 0 ? ` (+${days})` : ""}`;
}
