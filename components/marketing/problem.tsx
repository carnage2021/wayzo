import { IconArrow } from "./icons";

const CHAOS: [string, number][] = [
  ["Booking emails", -3],
  ["23 screenshots", 2],
  ["Saved reels", -1],
  ["Group chat chaos", 3],
  ["Budget spreadsheet", -2],
  ["Map pins", 1],
  ["15 browser tabs", -3],
  ["Notes app", 2],
  ["Split-the-bill app", -1],
];

export function Problem() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="wrap grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div data-rv="left">
          <div className="eyebrow text-blue">The problem</div>
          <h2 className="font-display mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-extrabold">
            One trip shouldn&apos;t need nine apps.
          </h2>
          <p className="text-muted mt-[22px] max-w-[500px] text-lg leading-[1.65]">
            Bookings buried in email. Plans lost in the group chat. Saved reels nobody opens. A spreadsheet
            for money. Wayzo pulls it all into one trip that plans itself.
          </p>
        </div>
        <div
          data-rv="right"
          className="bg-mist relative min-h-[400px] overflow-hidden rounded-[32px] p-[30px]"
        >
          <div className="flex flex-wrap gap-2.5">
            {CHAOS.map(([label, rot]) => (
              <span
                key={label}
                className="text-muted rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold line-through"
                style={{ transform: `rotate(${rot}deg)` }}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="lift bg-ink absolute inset-x-[30px] bottom-[30px] flex items-center justify-between gap-4 rounded-[22px] px-6 py-[22px] text-white">
            <div>
              <div className="text-muted-dark text-[13px]">Replace all of it with</div>
              <div className="font-display mt-0.5 text-[28px] font-extrabold">
                One trip on <span className="text-lime">Wayzo</span>
              </div>
            </div>
            <span className="bg-lime inline-flex size-[50px] shrink-0 items-center justify-center rounded-full">
              <IconArrow size={22} stroke="#0B1020" strokeWidth={2.6} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
