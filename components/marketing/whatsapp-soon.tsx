import { ArrowIcon, buttonVariants } from "@/components/ui/button";

/** Marketing-only teaser. WhatsApp itself is MVP 2 — not built. */
export function WhatsAppSoon() {
  return (
    <section className="bg-white pb-20 lg:pb-32">
      <div className="wrap">
        <div
          data-rv="scale"
          className="bg-mist grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[36px] p-[clamp(28px,5vw,64px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]"
        >
          <div>
            <div className="bg-lime text-ink inline-flex items-center gap-2 rounded-full px-3.5 py-[7px] text-[13px] font-bold">
              Coming soon
            </div>
            <h2 className="font-display mt-5 text-[clamp(34px,4vw,52px)] leading-[1.04] font-extrabold">
              Soon, just forward it on WhatsApp.
            </h2>
            <p className="text-muted mt-[18px] max-w-[500px] text-lg leading-[1.65]">
              Forward tickets, log expenses and ask &quot;what&apos;s next?&quot; straight from chat.
              Everything lands in your Wayzo dashboard. Waitlist members get it first.
            </p>
            <a className={`${buttonVariants({ variant: "ink" })} mt-7`} href="#waitlist">
              Join the waitlist <ArrowIcon />
            </a>
          </div>
          <div className="flex flex-col gap-2.5 text-sm leading-[1.45]">
            <div className="float bg-blue-strong max-w-[80%] self-end rounded-[18px_18px_4px_18px] px-3.5 py-3 font-semibold text-white">
              Bali_villa_booking.pdf
            </div>
            <div className="max-w-[86%] self-start rounded-[18px_18px_18px_4px] bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(11,16,32,.06)]">
              Added <b>Villa in Canggu</b> to <b className="text-blue">Bali Trip</b>. Check-in Sat 14:00.
            </div>
            <div className="floatb bg-blue-strong max-w-[80%] self-end rounded-[18px_18px_4px_18px] px-3.5 py-3 text-white">
              paid 96 dinner, split 4
            </div>
            <div className="max-w-[86%] self-start rounded-[18px_18px_18px_4px] bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(11,16,32,.06)]">
              Logged. Everyone owes you $24.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
