import { notFound } from "next/navigation";
import { Crown, Link2, Mail } from "lucide-react";
import { CopyButton } from "@/components/app/copy-button";
import { PageHeader } from "@/components/trip/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Tag } from "@/components/ui/chip";
import { requireUser } from "@/lib/auth";
import { inboundAddress } from "@/lib/env";
import { getTrip } from "@/lib/trips/queries";

const joined = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function MembersPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const user = await requireUser(`/trips/${tripId}/members`);
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Trip"
        title="Members"
        description="Everyone on this trip can add bookings, plan items, expenses and photos, and vote on stays."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card size="lg" className="gap-2">
          <CardTitle className="mb-2">
            {trip.members.length} {trip.members.length === 1 ? "traveller" : "travellers"}
          </CardTitle>
          <ul className="divide-soft-line flex flex-col divide-y">
            {trip.members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-4 py-3.5">
                <Avatar person={m.profile} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {m.profile.name ?? "Traveller"}
                    {m.user_id === user.id && <span className="text-subtle font-normal"> (you)</span>}
                  </div>
                  <div className="text-subtle text-[13px]">Joined {joined.format(new Date(m.joined_at))}</div>
                </div>
                {m.role === "owner" ? (
                  <Tag variant="ink">
                    <Crown className="text-lime size-3.5" aria-hidden /> Owner
                  </Tag>
                ) : (
                  <Tag variant="mist">Member</Tag>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-5">
          <Card variant="ink" size="lg">
            <Tag variant="lime" className="self-start">
              Coming soon
            </Tag>
            <CardTitle className="text-[24px]">Invite your group</CardTitle>
            <CardDescription className="text-muted-dark">
              Invite by email or share a link. Their tickets land in the same trip, and everyone sees changes
              live.
            </CardDescription>
            <div className="mt-1 flex flex-col gap-2 text-sm text-white/80">
              <span className="inline-flex items-center gap-2">
                <Mail className="text-lime size-4" aria-hidden /> Email invites
              </span>
              <span className="inline-flex items-center gap-2">
                <Link2 className="text-lime size-4" aria-hidden /> Share link (expires in 14 days)
              </span>
            </div>
          </Card>
          <Card>
            <CardTitle>Trip email address</CardTitle>
            <CardDescription>
              Members can forward booking confirmations here from their verified emails.
            </CardDescription>
            <div className="bg-mist flex flex-wrap items-center justify-between gap-3 rounded-[18px] p-3.5">
              <code className="min-w-0 truncate text-sm font-semibold">
                {inboundAddress(trip.inbound_code)}
              </code>
              <CopyButton value={inboundAddress(trip.inbound_code)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
