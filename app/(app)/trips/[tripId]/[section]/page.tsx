import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/trip/page-header";
import { TRIP_SECTIONS } from "@/components/trip/trip-nav-items";
import { buttonVariants } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";

/** Sections that ship in later roadmap phases get a designed "coming soon" state. */
export default async function TripSectionPage({
  params,
}: {
  params: Promise<{ tripId: string; section: string }>;
}) {
  const { tripId, section } = await params;
  const meta = TRIP_SECTIONS.find((s) => s.slug === section && s.phase > 1);
  if (!meta) notFound();
  const { Icon } = meta;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow="Trip" title={meta.label} />
      <section className="grid-bg relative flex flex-col items-center gap-5 overflow-hidden rounded-[32px] px-6 py-16 text-center text-white sm:py-24">
        <div
          className="border-lime/20 absolute top-1/2 left-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border-[1.5px] border-dashed"
          aria-hidden
        >
          <span className="bg-lime absolute -top-1.5 left-1/2 size-3 rounded-full" />
        </div>
        <span className="bg-lime text-ink relative inline-flex size-20 items-center justify-center rounded-[26px]">
          <Icon className="size-9" aria-hidden />
        </span>
        <Tag variant="lime" className="relative">
          Coming soon
        </Tag>
        <h2 className="font-display relative max-w-lg text-[clamp(28px,3.6vw,40px)] leading-[1.05] font-extrabold">
          {meta.label} is on its way.
        </h2>
        <p className="relative max-w-md text-base leading-relaxed text-white/75">{meta.blurb}</p>
        <Link href={`/trips/${tripId}`} className={`${buttonVariants({ variant: "ghost" })} relative mt-2`}>
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
