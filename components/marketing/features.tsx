import { IconGrip } from "./icons";

export function Features() {
  return (
    <section id="features" className="bg-white py-20 lg:py-32">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div data-rv className="max-w-[640px]">
            <div className="eyebrow text-blue">Features</div>
            <h2 className="font-display mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-extrabold">
              Everything your trip needs, in one place.
            </h2>
          </div>
          <p data-rv data-d="2" className="text-muted m-0 max-w-[380px] text-[17px] leading-[1.6]">
            From the first ticket to the last photo, Wayzo handles the boring parts so you can enjoy the trip.
          </p>
        </div>

        <div className="mt-[60px] grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Tickets in, trip out */}
          <div data-rv="scale" className="lg:col-span-2">
            <div className="lift bg-ink grid h-full min-h-[380px] grid-cols-1 items-center gap-7 rounded-[30px] p-[38px] text-white lg:grid-cols-2">
              <div>
                <div className="bg-lime text-ink inline-flex rounded-full px-3 py-1.5 text-[13px] font-bold">
                  Tickets in, trip out
                </div>
                <h3 className="font-display mt-[18px] text-[34px] leading-[1.08] font-extrabold">
                  Upload anything. AI does the filing.
                </h3>
                <p className="mt-3.5 text-base leading-[1.6] text-white/75">
                  PDFs, screenshots or forwarded emails. Wayzo reads dates, places and booking codes, drops
                  them into the right trip and sets reminders.
                </p>
              </div>
              <div className="bg-ink-2 relative overflow-hidden rounded-[22px] border border-white/[.08] p-[22px]">
                <div
                  className="scanline bg-lime absolute inset-x-0 top-[22px] h-0.5 shadow-[0_0_18px_#D7FF3D]"
                  aria-hidden="true"
                />
                <div className="text-muted-dark text-xs">Boarding pass</div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="font-display text-4xl font-extrabold">LHR</div>
                  <svg
                    width="40"
                    height="20"
                    viewBox="0 0 40 20"
                    fill="none"
                    stroke="#D7FF3D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M2 10h34M30 4l6 6-6 6" />
                  </svg>
                  <div className="font-display text-4xl font-extrabold">LIS</div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
                  {[
                    ["Date", "Fri 12"],
                    ["Departs", "11:05"],
                    ["Seat", "14C"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-muted-dark">{k}</div>
                      <div className="mt-0.5 font-semibold">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-[18px] h-1.5 overflow-hidden rounded-full bg-[#232B45]">
                  <div className="fillbar bg-lime h-full rounded-full" />
                </div>
                <div className="text-lime mt-2 text-xs font-semibold">Added to Lisbon Trip</div>
              </div>
            </div>
          </div>

          {/* 7 AM brief */}
          <div data-rv="scale" data-d="2">
            <div className="lift bg-lime flex h-full min-h-[380px] flex-col justify-between gap-6 rounded-[30px] p-8">
              <div>
                <h3 className="font-display m-0 text-[28px] leading-[1.1] font-extrabold">Your 7 AM brief</h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-[#2A3150]">
                  Today&apos;s plan, weather, check-in times and booking codes, in your inbox and as a
                  notification before breakfast.
                </p>
              </div>
              <div className="bg-ink flex flex-col gap-2.5 rounded-[18px] p-4 text-[13px] text-white">
                {[
                  ["09:30", "Tram 28 to Alfama"],
                  ["13:00", "Lunch, Time Out Market"],
                  ["19:30", "Sunset at Miradouro"],
                ].map(([t, l]) => (
                  <div key={t} className="flex justify-between gap-3">
                    <span className="text-muted-dark">{t}</span>
                    <span className="font-semibold">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stays */}
          <div data-rv data-d="1">
            <div className="lift bg-mist flex h-full flex-col gap-5 rounded-[30px] p-8">
              <div>
                <h3 className="font-display m-0 text-[26px] leading-[1.1] font-extrabold">
                  Stays that fit your whole group
                </h3>
                <p className="text-muted mt-2.5 text-[15px] leading-[1.6]">
                  Hotels, villas, resorts or hostels, matched to your budget and plans. Everyone votes, then
                  you book in one click.
                </p>
              </div>
              <div className="mt-auto flex items-center gap-3 rounded-[18px] bg-white p-3.5">
                <div className="bg-avatar-3 size-14 shrink-0 rounded-[14px]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">Villa with pool, Canggu</div>
                  <div className="text-muted mt-0.5 text-xs">4.8 · sleeps 6 · 3 votes</div>
                </div>
                <span className="bg-ink rounded-full px-3 py-[7px] text-xs font-bold text-white">Book</span>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div data-rv data-d="2">
            <div className="lift bg-mist flex h-full flex-col gap-5 rounded-[30px] p-8">
              <div>
                <h3 className="font-display m-0 text-[26px] leading-[1.1] font-extrabold">
                  A plan you can actually edit
                </h3>
                <p className="text-muted mt-2.5 text-[15px] leading-[1.6]">
                  Drag, drop, delete, or ask the AI to add a sunset spot. Your whole group sees changes live.
                </p>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-ink rounded-full px-3 py-[7px] text-xs font-bold text-white">Day 1</span>
                <span className="text-muted rounded-full bg-white px-3 py-[7px] text-xs font-semibold">
                  Day 2
                </span>
                <span className="text-muted rounded-full bg-white px-3 py-[7px] text-xs font-semibold">
                  Day 3
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 rounded-[14px] bg-white px-3 py-[11px] text-[13px]">
                  <IconGrip size={14} stroke="#7A8397" />
                  <span className="font-semibold">Fushimi Inari, early</span>
                </div>
                <div className="float border-blue flex items-center gap-2.5 rounded-[14px] border-[1.5px] bg-white px-3 py-[11px] text-[13px] shadow-[0_12px_26px_rgba(59,91,255,.2)]">
                  <IconGrip size={14} stroke="#3B5BFF" />
                  <span className="font-semibold">Ramen near Gion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Split costs */}
          <div data-rv data-d="3">
            <div className="lift bg-blue flex h-full flex-col gap-5 rounded-[30px] p-8 text-white">
              <div>
                <h3 className="font-display m-0 text-[26px] leading-[1.1] font-extrabold">
                  Split costs, skip the awkward
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-white/90">
                  Add an expense in two taps and choose who shares it. Wayzo keeps a running tally of who owes
                  whom.
                </p>
              </div>
              <div className="bg-ink/30 mt-auto flex flex-col gap-2.5 rounded-[18px] p-3.5 text-[13px]">
                {[
                  ["Maya → You", "$58"],
                  ["Sam → You", "$42"],
                  ["Leo → Maya", "Settled"],
                ].map(([w, a]) => (
                  <div key={w} className="flex justify-between">
                    <span>{w}</span>
                    <span className="font-bold">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
