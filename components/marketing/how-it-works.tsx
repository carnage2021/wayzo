import { IconUpload } from "./icons";

const STEPS = [
  {
    n: "01",
    title: "Upload your tickets",
    body: "Drag in a PDF, snap a screenshot or forward the confirmation email to your trip. Flights, trains, buses, hotels, tables and tours land in the right place, with reminders set.",
  },
  {
    n: "02",
    title: "Tell us your vibe",
    body: "Budget, stay type, food, nightlife and pace, in a few quick taps. Everyone in your group answers, and Wayzo blends it into one plan that works for all.",
  },
  {
    n: "03",
    title: "Travel easy",
    body: 'Stays, food spots and a day-by-day plan you can edit, plus a morning brief by email and notification. No more "so what\'s the plan today?"',
  },
];

const pill = "rounded-full px-3.5 py-[9px]";
const pillOff = `${pill} border border-white/20`;
const pillOn = `${pill} bg-lime font-bold text-ink`;

/** Sticky phone that cross-fades screens as each step scrolls into view (html[data-step]). */
export function HowItWorks() {
  return (
    <section id="how" className="bg-mist py-20 lg:py-32">
      <div className="wrap">
        <div data-rv className="max-w-[720px]">
          <div className="eyebrow text-blue">How it works</div>
          <h2 className="font-display mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-extrabold">
            Three steps. Zero planning stress.
          </h2>
        </div>
        <div className="mt-[72px] grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          <div className="sticky-col sticky top-[120px] flex justify-center">
            <div className="bg-ink relative h-[560px] w-[340px] max-w-full overflow-hidden rounded-[44px] border-[10px] border-[#1E2640] shadow-[0_40px_90px_rgba(11,16,32,.25)]">
              {/* screen 1 */}
              <div className="scr scr1 flex flex-col gap-3 px-4 py-6 text-[13px] text-white">
                <div className="text-muted-dark text-xs">Step 1 · Upload</div>
                <div className="font-display text-2xl leading-[1.1] font-extrabold">Japan Trip</div>
                <div className="border-lime/55 bg-lime/5 flex flex-col items-center gap-2 rounded-[18px] border-[1.5px] border-dashed px-3.5 py-[22px] text-center">
                  <span className="bg-lime flex size-11 items-center justify-center rounded-[14px]">
                    <IconUpload size={20} stroke="#0B1020" strokeWidth={2.4} />
                  </span>
                  <span className="font-bold">Drop tickets or tap to upload</span>
                  <span className="text-muted-dark text-[11px]">PDF, screenshot or forwarded email</span>
                </div>
                {["Hotel_Kyoto.pdf", "Shinkansen.png"].map((f) => (
                  <div key={f} className="bg-ink-2 flex items-center justify-between rounded-[14px] p-3">
                    <span className="font-semibold">{f}</span>
                    <span className="text-lime font-bold">Added</span>
                  </div>
                ))}
                <div className="bg-ink-2 flex flex-col gap-2 rounded-[14px] border border-white/[.08] p-3">
                  <div className="flex justify-between">
                    <span className="text-muted-dark">Check-in</span>
                    <span className="font-semibold">Mon 15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-dark">Reminders</span>
                    <span className="text-lime font-semibold">2 set</span>
                  </div>
                </div>
              </div>
              {/* screen 2 */}
              <div className="scr scr2 flex flex-col gap-4 px-[18px] py-6 text-[13px] text-white">
                <div className="text-muted-dark text-xs">Step 2 · Your vibe</div>
                <div className="font-display text-2xl leading-[1.1] font-extrabold">
                  Where do you want to stay?
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={pillOff}>Hotel</span>
                  <span className={pillOn}>Villa</span>
                  <span className={pillOff}>Resort</span>
                  <span className={pillOff}>Hostel</span>
                </div>
                <div className="font-display mt-1.5 text-xl font-bold">Food?</div>
                <div className="flex flex-wrap gap-2">
                  <span className={pillOn}>Vegetarian</span>
                  <span className={pillOff}>Anything</span>
                  <span className={pillOn}>Bars</span>
                </div>
                <div className="bg-ink-2 mt-auto flex items-center gap-2.5 rounded-2xl border border-white/[.08] p-3.5">
                  <div className="flex">
                    <span className="border-ink-2 bg-avatar-1 size-7 rounded-full border-2" />
                    <span className="border-ink-2 bg-avatar-2 -ml-2 size-7 rounded-full border-2" />
                    <span className="border-ink-2 bg-avatar-3 -ml-2 size-7 rounded-full border-2" />
                  </div>
                  <span className="text-xs">3 of 4 friends answered</span>
                </div>
              </div>
              {/* screen 3 */}
              <div className="scr scr3 flex flex-col gap-3 px-4 py-6 text-[13px] text-white">
                <div className="text-muted-dark text-xs">Step 3 · Travel easy</div>
                <div className="bg-lime text-ink rounded-[18px] p-3.5">
                  <div className="text-xs font-bold">7:00 AM brief</div>
                  <div className="font-display mt-0.5 text-xl font-extrabold">Day 2 in Kyoto</div>
                  <div className="mt-0.5 text-xs">Clear skies, 19°</div>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    ["07:30", "Fushimi Inari, before crowds"],
                    ["12:30", "Lunch at Nishiki Market"],
                    ["17:00", "Gion walk, then dinner"],
                  ].map(([t, l]) => (
                    <div key={t} className="bg-ink-2 flex items-center gap-3 rounded-[14px] p-3">
                      <span className="text-muted-dark w-[42px]">{t}</span>
                      <span className="font-semibold">{l}</span>
                    </div>
                  ))}
                  <div className="border-lime/50 bg-ink-2 text-lime flex items-center gap-3 rounded-[14px] border border-dashed p-3">
                    <span className="w-[42px]">+</span>
                    <span className="font-semibold">Ask AI to add a spot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="story-steps flex flex-col pt-10 pb-[120px]">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                data-st={i + 1}
                className={`stp st${i + 1} relative flex min-h-[440px] flex-col justify-center pl-8`}
              >
                <span className="stbar" />
                <span className="font-display text-[72px] leading-none font-extrabold text-[#C9D0DD]">
                  {s.n}
                </span>
                <h3 className="font-display mt-4 text-4xl leading-[1.08] font-extrabold">{s.title}</h3>
                <p className="text-muted mt-3.5 max-w-[440px] text-lg leading-[1.65]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
