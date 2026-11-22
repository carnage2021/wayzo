import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Ticket, Users } from "lucide-react";
import { TripForm } from "@/components/trip/trip-form";
import { getProfile, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New trip" };

const NEXT_STEPS = [
  { Icon: Ticket, text: "Drop in your flight, train and hotel bookings" },
  { Icon: Mail, text: "Or forward confirmations to your trip's own email address" },
  { Icon: Users, text: "Invite your group so everyone sees the same plan" },
];

export default async function NewTripPage() {
  const user = await requireUser("/trips/new");
  const profile = await getProfile(user.id);

  return (
    <div className="mx-auto flex max-w-[1040px] flex-col gap-8">
      <Link
        href="/trips"
        className="text-subtle hover:text-ink inline-flex items-center gap-2 self-start text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden /> My trips
      </Link>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="border-soft-line rounded-[32px] border bg-white p-6 sm:p-10">
          <div className="eyebrow text-blue">New trip</div>
          <h1 className="font-display mt-3 mb-8 text-[clamp(32px,4vw,44px)] leading-[1.04] font-extrabold">
            Where to next?
          </h1>
          <TripForm
            mode="create"
            initial={{
              name: "",
              destinations: [],
              start_date: "",
              end_date: "",
              currency: profile?.currency ?? "USD",
            }}
          />
        </section>
        <aside className="grid-bg relative overflow-hidden rounded-[32px] p-8 text-white lg:sticky lg:top-24">
          <div className="bg-lime text-ink inline-flex rounded-full px-3 py-1.5 text-[13px] font-bold">
            Then what?
          </div>
          <h2 className="font-display mt-5 text-[28px] leading-[1.1] font-extrabold">
            Your dashboard fills itself.
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {NEXT_STEPS.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3.5">
                <span className="bg-lime/[.12] inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="text-lime size-5" aria-hidden />
                </span>
                <span className="text-[15px] leading-snug text-white/85">{text}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
