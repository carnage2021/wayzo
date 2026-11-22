import { IconCheck, IconRoute } from "./icons";

const ACTIVITY = [
  { cls: "float top-[22px] left-[14%]", initial: "M", fill: "bg-avatar-1", text: "Maya added a hotel" },
  { cls: "floatb bottom-9 left-[2%]", initial: "S", fill: "bg-avatar-2", text: "Sam voted for the villa" },
  {
    cls: "float right-0 top-[46%]",
    initial: "L",
    fill: "bg-avatar-3",
    text: "Leo uploaded his train ticket",
  },
];

export function Groups() {
  return (
    <section id="groups" className="bg-ink overflow-hidden py-20 text-white lg:py-32">
      <div className="wrap grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div data-rv="scale" className="relative flex min-h-[420px] items-center justify-center">
          <div
            className="spin absolute size-[360px] rounded-full border-[1.5px] border-dashed border-white/[.18]"
            aria-hidden="true"
          >
            <span className="bg-lime absolute -top-1.5 left-1/2 size-3 rounded-full" />
          </div>
          <div
            className="spin-r border-lime/25 absolute size-[230px] rounded-full border-[1.5px]"
            aria-hidden="true"
          />
          <div className="pulse bg-lime relative flex size-[124px] items-center justify-center rounded-[38px]">
            <IconRoute size={58} stroke="#0B1020" strokeWidth={2.2} />
          </div>
          {ACTIVITY.map((a) => (
            <div
              key={a.text}
              className={`${a.cls} absolute flex items-center gap-2 rounded-full border border-white/10 bg-[#1A2136] py-1.5 pr-3.5 pl-1.5 text-[13px] font-semibold`}
            >
              <span
                className={`text-ink inline-flex size-[30px] items-center justify-center rounded-full font-bold ${a.fill}`}
              >
                {a.initial}
              </span>
              {a.text}
            </div>
          ))}
        </div>
        <div data-rv="right">
          <div className="eyebrow text-lime">Built for groups</div>
          <h2 className="font-display mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-extrabold">
            Your whole crew, one shared trip.
          </h2>
          <p className="mt-[22px] max-w-[500px] text-lg leading-[1.65] text-white/[.78]">
            Invite friends by email or a link. Everyone&apos;s tickets land in the same trip, everyone votes
            on stays, and nobody asks &quot;what&apos;s the plan?&quot; again.
          </p>
          <div className="mt-8 flex flex-col gap-3.5">
            {[
              "Preferences blended: budget, diet, pace",
              "A live itinerary everyone can edit",
              "A shared album that becomes a trip story to post",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3.5">
                <span className="bg-lime inline-flex size-[30px] shrink-0 items-center justify-center rounded-full">
                  <IconCheck size={14} stroke="#0B1020" strokeWidth={3} />
                </span>
                <span className="text-base leading-normal">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
