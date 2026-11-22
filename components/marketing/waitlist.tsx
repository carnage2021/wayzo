import { IconChat, IconGift, IconUsers } from "./icons";
import { WaitlistForm } from "./waitlist-form";

const PERKS = [
  { Icon: IconGift, text: "Free for everyone during early access" },
  { Icon: IconUsers, text: "Bring your whole travel crew in with you" },
  { Icon: IconChat, text: "Help shape what we build next" },
];

export function Waitlist() {
  return (
    <section id="waitlist" className="bg-mist px-6 py-8">
      <div
        data-rv="scale"
        className="bg-ink relative mx-auto max-w-[1200px] overflow-hidden rounded-[40px] bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[length:56px_56px] p-[clamp(32px,6vw,80px)] text-white"
      >
        <div
          className="glow absolute -bottom-40 -left-[120px] size-[480px] rounded-full bg-[radial-gradient(circle,rgba(215,255,61,.22),rgba(215,255,61,0)_65%)]"
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[.14] bg-white/[.07] py-2 pr-4 pl-2.5 text-sm text-white/85">
              <span className="pulse bg-lime inline-block size-2 rounded-full" />
              Early access
            </div>
            <h2 className="font-display mt-[22px] text-[clamp(40px,5.4vw,68px)] leading-none font-extrabold">
              Your next trip, <span className="text-lime">minus the chaos.</span>
            </h2>
            <p className="mt-5 max-w-[460px] text-lg leading-[1.6] text-white/[.78]">
              Join the waitlist and be one of the first to run a trip from your Wayzo dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              {PERKS.map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3.5">
                  <span className="bg-lime/[.12] inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <Icon size={20} stroke="#D7FF3D" />
                  </span>
                  <span className="text-base">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-ink flex min-h-[440px] flex-col justify-center rounded-[30px] bg-white p-[clamp(24px,3.4vw,40px)] shadow-[0_40px_90px_rgba(0,0,0,.35)]">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
