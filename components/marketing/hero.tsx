import { ArrowIcon, buttonVariants } from "@/components/ui/button";
import {
  IconCalendar,
  IconCheck,
  IconCoin,
  IconGrid,
  IconHome,
  IconRoute,
  IconSun,
  IconUpload,
} from "./icons";

const DESTINATIONS = [
  "Lisbon",
  "Bali",
  "Kyoto",
  "Cape Town",
  "Tulum",
  "Istanbul",
  "Goa",
  "Reykjavík",
  "Marrakech",
  "Barcelona",
];

function Word({ i, children, lime = false }: { i: number; children: string; lime?: boolean }) {
  return (
    <span className="wmask">
      <span className={`word w${i}`} style={lime ? { color: "var(--lime)" } : undefined}>
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  return (
    <section id="top" className="grid-bg relative overflow-hidden text-white">
      <div
        className="glow absolute top-[180px] right-[6%] hidden size-[520px] rounded-full bg-[radial-gradient(circle,rgba(59,91,255,.35),rgba(59,91,255,0)_65%)] lg:block"
        aria-hidden="true"
      />
      <div className="wrap">
        <div className="grid grid-cols-1 items-center gap-12 pt-[168px] pb-[120px] lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)]">
          <div>
            <div className="rise h1d inline-flex items-center gap-2.5 rounded-full border border-white/[.14] bg-white/[.07] py-2 pr-4 pl-2.5 text-sm text-white/85">
              <span className="pulse bg-lime inline-block size-2 rounded-full" />
              AI trip dashboard · early access open
            </div>
            <h1 className="font-display mt-[26px] mb-0 text-[clamp(44px,5.8vw,80px)] leading-[.98] font-extrabold">
              <Word i={1}>Upload</Word> <Word i={2}>your</Word> <Word i={3}>tickets.</Word>
              <br />
              <Word i={4} lime>
                We&apos;ll
              </Word>{" "}
              <Word i={5} lime>
                run
              </Word>{" "}
              <Word i={6} lime>
                the
              </Word>{" "}
              <Word i={7} lime>
                trip.
              </Word>
            </h1>
            <p className="rise h3d mt-[26px] max-w-[540px] text-[19px] leading-[1.6] text-white/[.78]">
              Drop in your flight, train or hotel bookings. Your trip dashboard fills itself with where to
              stay, where to eat, a day-by-day plan, who owes what and a brief for your group every morning.
            </p>
            <div className="rise h4d mt-[38px] flex flex-wrap gap-3">
              <a className={buttonVariants({ variant: "lime" })} href="#waitlist">
                Get early access <ArrowIcon />
              </a>
              <a className={buttonVariants({ variant: "ghost" })} href="#how">
                See how it works
              </a>
            </div>
            <div className="rise h5d mt-[34px] flex flex-wrap gap-[22px] text-sm text-white/[.72]">
              {["No forms to fill", "Made for groups", "Works on any device"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <IconCheck size={16} stroke="#D7FF3D" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="px-slow">
            <div className="rise h6d relative flex min-h-[620px] items-center justify-center">
              <div
                className="spin border-lime/25 absolute top-[60px] hidden size-[540px] rounded-full border-[1.5px] border-dashed lg:block"
                aria-hidden="true"
              >
                <span className="bg-lime absolute -top-[7px] left-1/2 size-3.5 rounded-full" />
              </div>
              <div
                className="spin-r absolute top-[120px] hidden size-[420px] rounded-full border border-white/10 lg:block"
                aria-hidden="true"
              >
                <span className="bg-blue absolute -bottom-[5px] left-[30%] size-2.5 rounded-full" />
              </div>

              <HeroDashboard />

              <div className="float text-ink shadow-float absolute bottom-7 -left-9 hidden w-[226px] rounded-[20px] bg-white px-[18px] py-4 lg:block">
                <div className="text-blue flex items-center gap-2 text-xs font-bold">
                  <IconSun size={16} />
                  7:00 AM · Today
                </div>
                <div className="mt-1.5 text-[15px] font-bold">Belém at 10:00, lunch by the river</div>
                <div className="text-muted mt-1 text-xs">Sunny, 24°. Check-out tomorrow 11:00.</div>
              </div>

              <div className="floatb bg-lime text-ink shadow-float absolute top-[22px] -right-[22px] hidden w-[214px] rounded-[20px] px-[18px] py-4 lg:block">
                <div className="text-xs font-bold">Group balance</div>
                <div className="font-display mt-1 text-[23px] font-extrabold">Sam owes you $42</div>
                <div className="bg-ink text-lime mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold">
                  Settle up
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-white/[.08] py-6" aria-label="Destinations">
        <div className="marquee font-display flex w-max gap-14 text-2xl font-bold whitespace-nowrap text-white/60">
          {[0, 1].map((copy) =>
            DESTINATIONS.map((d) => (
              <span key={`${copy}-${d}`} className="contents">
                <span aria-hidden={copy === 1 || undefined}>{d}</span>
                <span className="text-lime" aria-hidden="true">
                  ✦
                </span>
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

function HeroDashboard() {
  return (
    <div className="text-ink relative w-full max-w-[600px] self-center overflow-hidden rounded-[22px] bg-white text-xs shadow-[0_50px_120px_rgba(0,0,0,.55)]">
      <div className="border-soft-line bg-mist flex items-center gap-3 border-b px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#FF7A6B]" />
          <span className="size-2.5 rounded-full bg-[#FFC34D]" />
          <span className="size-2.5 rounded-full bg-[#4CD38A]" />
        </div>
        <div className="text-subtle flex-1 rounded-lg bg-white px-3 py-1.5 text-[11px]">
          app.wayzo.com/trips/lisbon
        </div>
      </div>
      <div className="flex">
        <div className="bg-ink flex w-14 flex-col items-center gap-4 py-4" aria-hidden="true">
          <span className="bg-lime flex size-[30px] items-center justify-center rounded-[9px]">
            <IconRoute size={16} stroke="#0B1020" strokeWidth={2.6} />
          </span>
          <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-white/[.12]">
            <IconGrid size={15} stroke="#FFFFFF" />
          </span>
          <span className="flex size-[30px] items-center justify-center">
            <IconCalendar size={15} stroke="#7A8397" />
          </span>
          <span className="flex size-[30px] items-center justify-center">
            <IconHome size={15} stroke="#7A8397" />
          </span>
          <span className="flex size-[30px] items-center justify-center">
            <IconCoin size={15} stroke="#7A8397" />
          </span>
        </div>
        <div className="bg-canvas flex min-w-0 flex-1 flex-col gap-3 p-[18px]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-[22px] leading-[1.1] font-extrabold">Lisbon Trip</div>
              <div className="text-subtle mt-0.5">Apr 12–16 · 4 travellers</div>
            </div>
            <div className="flex" aria-hidden="true">
              <span className="border-canvas bg-avatar-1 size-7 rounded-full border-2" />
              <span className="border-canvas bg-avatar-2 -ml-2 size-7 rounded-full border-2" />
              <span className="border-canvas bg-avatar-3 -ml-2 size-7 rounded-full border-2" />
              <span className="border-canvas bg-ink -ml-2 inline-flex size-7 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white">
                +1
              </span>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-3">
            <div className="flex flex-col gap-2 rounded-[14px] border-[1.5px] border-dashed border-[#B9C2D3] bg-white p-3">
              <div className="flex items-center gap-2 font-bold">
                <IconUpload size={16} stroke="#3B5BFF" />
                Drop tickets here
              </div>
              <FileRow className="pop1" name="Lisbon_flight.pdf" />
              <FileRow className="pop2" name="Alfama_flat.png" />
              <div className="pop3 flex items-center gap-2 rounded-[10px] bg-[#EEF1FF] px-2.5 py-2 font-semibold text-[#2A44D6]">
                <span className="dot" style={{ background: "#3B5BFF" }} />
                Reading train ticket…
              </div>
            </div>
            <div className="bg-ink flex flex-col justify-between gap-2.5 rounded-[14px] p-3 text-white">
              <div className="text-muted-dark">Group budget</div>
              <div className="font-display text-[22px] font-extrabold">
                $1,840 <span className="text-muted-dark text-[13px] font-semibold">of $2,400</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-md bg-[#232B45]">
                <div className="bg-lime h-full w-[76%] rounded-md" />
              </div>
              <div className="text-lime font-semibold">You&apos;re owed $100</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-soft-line flex flex-col gap-2 rounded-[14px] border bg-white p-3">
              <div className="flex justify-between font-bold">
                <span>Today · Day 2</span>
                <span className="text-blue">24°</span>
              </div>
              {[
                ["10:00", "Belém Tower"],
                ["13:00", "Lunch by the river"],
                ["19:30", "Sunset, Miradouro"],
              ].map(([t, label]) => (
                <div key={t} className="flex gap-2.5">
                  <span className="text-subtle w-[34px]">{t}</span>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
            <div className="pop4 border-soft-line flex flex-col gap-2 rounded-[14px] border bg-white p-3">
              <div className="font-bold">Stays for your group</div>
              {[
                ["Loft, Bairro Alto", "4.8"],
                ["Alfama view flat", "4.7"],
                ["Chiado guesthouse", "4.6"],
              ].map(([n, r]) => (
                <div key={n} className="flex justify-between">
                  <span className="font-semibold">{n}</span>
                  <span className="text-blue font-bold">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileRow({ name, className }: { name: string; className: string }) {
  return (
    <div
      className={`${className} bg-mist flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-2`}
    >
      <span className="truncate font-semibold">{name}</span>
      <span className="text-success font-bold whitespace-nowrap">Added</span>
    </div>
  );
}
