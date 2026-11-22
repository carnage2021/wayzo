import Link from "next/link";
import { BedDouble, Check, Clock, Mail, Sparkles, UserPlus, Users } from "lucide-react";
import { TicketUploader } from "@/components/bookings/ticket-uploader";
import { CopyButton } from "@/components/app/copy-button";
import { Avatar, AvatarStack } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/chip";
import { formatMoney } from "@/lib/currencies";
import type { MemberWithProfile } from "@/lib/trips/queries";
import { cn } from "@/lib/utils";

// ---------- Checklist (before trip) ----------

export type ChecklistItem = { label: string; hint: string; done: boolean; href: string; soon?: boolean };

export function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  const done = items.filter((i) => i.done).length;
  return (
    <Card size="lg" className="gap-5">
      <CardHeader>
        <div>
          <CardTitle className="text-[22px]">Get your trip ready</CardTitle>
          <p className="text-subtle mt-1 text-sm">
            {done} of {items.length} done
          </p>
        </div>
        <div className="relative size-12" aria-hidden>
          <svg viewBox="0 0 36 36" className="size-12 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--mist)" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(done / items.length) * 94.2} 94.2`}
            />
          </svg>
        </div>
      </CardHeader>
      <ol className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-center gap-3.5 rounded-[18px] p-3 transition-colors",
                item.done ? "bg-mist" : "ring-soft-line hover:ring-ink bg-white ring-1",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                  item.done ? "border-ink bg-ink text-lime" : "border-line text-transparent",
                )}
              >
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block font-semibold", item.done && "text-subtle line-through")}>
                  {item.label}
                </span>
                <span className="text-subtle block truncate text-[13px]">{item.hint}</span>
              </span>
              {item.soon && !item.done && <Tag variant="mist">Soon</Tag>}
              <span className="sr-only">{item.done ? "Done" : "Not done"}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ---------- Today (during trip) ----------

export function TodayCard({ day, tripId }: { day: number; tripId: string }) {
  return (
    <Card variant="lime" size="lg" className="gap-4">
      <div className="flex items-center gap-2 text-[13px] font-bold">
        <Clock className="size-4" aria-hidden /> Today · Day {day}
      </div>
      <div className="font-display text-[28px] leading-tight font-extrabold">Have a great day out there.</div>
      <p className="text-[15px] leading-relaxed text-[#2A3150]">
        Your plan for today, weather and booking codes will show up here, and in your 7 AM brief.
      </p>
      <Link
        href={`/trips/${tripId}/bookings`}
        className="bg-ink text-lime mt-1 inline-flex self-start rounded-full px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
      >
        See bookings
      </Link>
    </Card>
  );
}

// ---------- Budget ----------

export function BudgetCard({
  spentMinor,
  plannedMinor,
  currency,
}: {
  spentMinor: number;
  plannedMinor: number | null;
  currency: string;
}) {
  const pct = plannedMinor ? Math.min(100, Math.round((spentMinor / plannedMinor) * 100)) : 0;
  return (
    <Card variant="ink" className="justify-between">
      <div className="text-muted-dark text-sm">Group budget</div>
      <div className="font-display text-[30px] leading-none font-extrabold">
        {formatMoney(spentMinor, currency)}{" "}
        {plannedMinor ? (
          <span className="text-muted-dark text-[15px] font-semibold">
            of {formatMoney(plannedMinor, currency)}
          </span>
        ) : (
          <span className="text-muted-dark text-[15px] font-semibold">spent</span>
        )}
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#232B45]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget used"
      >
        <div
          className="bg-lime h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-lime text-sm font-semibold">
        {plannedMinor ? `${pct}% used` : "Budget is set after your group's quiz"}
      </div>
    </Card>
  );
}

// ---------- Stay coverage ----------

export function StayCoverageCard({
  covered,
  total,
  tripId,
}: {
  covered: number;
  total: number;
  tripId: string;
}) {
  const gaps = total - covered;
  const pct = total ? Math.round((covered / total) * 100) : 0;
  return (
    <Card className="justify-between">
      <div className="flex items-center justify-between">
        <span className="text-blue inline-flex size-10 items-center justify-center rounded-xl bg-[#EEF1FF]">
          <BedDouble className="size-5" aria-hidden />
        </span>
        {total > 0 && gaps > 0 && (
          <Tag variant="blue">{gaps === 1 ? "1 night" : `${gaps} nights`} need a stay</Tag>
        )}
        {total > 0 && gaps === 0 && <Tag variant="lime">All nights covered</Tag>}
      </div>
      <div>
        <div className="text-subtle text-sm">Stay coverage</div>
        <div className="font-display mt-1 text-[30px] leading-none font-extrabold">
          {total ? (
            <>
              {covered}
              <span className="text-subtle text-[17px] font-semibold">/{total} nights</span>
            </>
          ) : (
            <span className="text-[22px]">Add dates</span>
          )}
        </div>
      </div>
      <div className="bg-mist h-2 overflow-hidden rounded-full" aria-hidden>
        <div className="bg-blue h-full rounded-full" style={{ width: `${pct}%` }} />
      </div>
      {total === 0 && (
        <Link href={`/trips/${tripId}/settings`} className="text-blue text-sm font-semibold hover:underline">
          Set trip dates
        </Link>
      )}
    </Card>
  );
}

// ---------- Members ----------

export function MembersCard({ members, tripId }: { members: MemberWithProfile[]; tripId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Travellers</CardTitle>
        <Link href={`/trips/${tripId}/members`} className="text-blue text-sm font-semibold hover:underline">
          View all
        </Link>
      </CardHeader>
      <div className="flex items-center gap-3">
        <AvatarStack people={members.map((m) => m.profile)} max={5} size={36} />
        <span className="text-subtle text-sm">
          {members.length === 1 ? "Just you so far" : `${members.length} travellers`}
        </span>
      </div>
      <Link
        href={`/trips/${tripId}/members`}
        className="border-line text-ink hover:border-ink flex items-center gap-3 rounded-[18px] border-[1.5px] border-dashed p-3 text-sm font-semibold transition-colors"
      >
        <span className="bg-mist inline-flex size-9 items-center justify-center rounded-full">
          <UserPlus className="size-[18px]" aria-hidden />
        </span>
        Invite your group
      </Link>
    </Card>
  );
}

// ---------- Activity ----------

export type ActivityEntry = {
  id: string;
  verb: string;
  created_at: string;
  actor: { id: string; name: string | null; avatar_url: string | null } | null;
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso: string, now = Date.now()) {
  const s = Math.round((Date.parse(iso) - now) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}

export function ActivityCard({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardTitle>Recent activity</CardTitle>
      {entries.length === 0 ? (
        <div className="bg-mist flex flex-col items-center gap-2 rounded-[18px] px-4 py-8 text-center">
          <Sparkles className="text-blue size-6" aria-hidden />
          <p className="text-subtle text-sm">Uploads, votes and plan changes from your group show up here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-3">
              {e.actor ? (
                <Avatar person={e.actor} size={32} />
              ) : (
                <span className="bg-mist inline-flex size-8 items-center justify-center rounded-full">
                  <Users className="size-4" aria-hidden />
                </span>
              )}
              <p className="min-w-0 flex-1 text-sm leading-snug">
                <span className="font-semibold">{e.actor?.name ?? "Someone"}</span>{" "}
                <span className="text-muted">{e.verb}</span>
              </p>
              <time dateTime={e.created_at} className="text-subtle shrink-0 text-xs">
                {timeAgo(e.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ---------- Quick upload ----------

export function QuickUploadCard({
  forwardingAddress,
  tripId,
  isOwner,
}: {
  forwardingAddress: string;
  tripId: string;
  isOwner: boolean;
}) {
  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle>Add tickets</CardTitle>
        <Link href={`/trips/${tripId}/bookings`} className="text-blue text-sm font-semibold hover:underline">
          All bookings
        </Link>
      </CardHeader>
      <TicketUploader tripId={tripId} isOwner={isOwner} compact />
      <div className="bg-mist flex flex-col gap-2 rounded-[18px] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="text-blue size-4" aria-hidden /> Forward booking emails to
          <Tag variant="mist">Soon</Tag>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <code className="text-ink min-w-0 truncate text-[15px] font-semibold">{forwardingAddress}</code>
          <CopyButton value={forwardingAddress} label="Copy" />
        </div>
      </div>
    </Card>
  );
}
