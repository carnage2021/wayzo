import { IconConfirm, IconLock, IconPin } from "./icons";

const ITEMS = [
  {
    Icon: IconPin,
    title: "Live, verified places",
    body: "Every stay, café and sight comes from live map data with real ratings and opening hours.",
  },
  {
    Icon: IconConfirm,
    title: "You confirm, always",
    body: "Wayzo shows what it read from your ticket before saving. Nothing gets booked without you.",
  },
  {
    Icon: IconLock,
    title: "Private by default",
    body: "Your trips are yours. Share a story only when you want to, and delete your data anytime.",
  },
];

export function Trust() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="wrap">
        <div data-rv className="mx-auto max-w-[720px] text-center">
          <div className="eyebrow text-blue">Why trust it</div>
          <h2 className="font-display mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-extrabold">
            Real places. Not AI guesses.
          </h2>
        </div>
        <div className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
          {ITEMS.map(({ Icon, title, body }, i) => (
            <div key={title} data-rv data-d={i + 1} className="border-ink border-t-2 pt-[26px]">
              <span className="bg-mist inline-flex size-12 items-center justify-center rounded-[14px]">
                <Icon size={22} stroke="#3B5BFF" />
              </span>
              <h3 className="font-display mt-[18px] text-2xl font-bold">{title}</h3>
              <p className="text-muted mt-2.5 text-base leading-[1.6]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
