export const FAQS = [
  {
    q: "Is Wayzo free?",
    a: "Yes, it's free during early access. Premium extras come later, and core trip planning stays free.",
  },
  {
    q: "Do I need to install an app?",
    a: "No. Wayzo runs in your browser on laptop and phone, and you can add it to your home screen like an app.",
  },
  {
    q: "Which countries does it work in?",
    a: "Wayzo is built to work wherever you travel: city breaks, beach weeks or multi-country trips.",
  },
  {
    q: "Does Wayzo book things for me?",
    a: "It suggests and links you to trusted booking partners. Once you book, forward the confirmation and it's added automatically.",
  },
  {
    q: "Is my ticket data safe?",
    a: "Trips are private by default and stored encrypted. You can delete a trip and its data anytime.",
  },
  {
    q: "Does it work with WhatsApp?",
    a: "Not yet. WhatsApp is coming soon, so you'll be able to forward tickets and get your brief in chat. Waitlist members get it first.",
  },
];

// TODO(open decision): replace with the real contact address (README "Contact email").
const CONTACT_EMAIL = "hello@wayzo.app";

/** Native <details> accordion, so it works without JS. */
export function Faq() {
  return (
    <section id="faq" className="bg-mist py-20 lg:py-32">
      <div className="wrap grid grid-cols-1 items-start gap-16 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <div data-rv="left">
          <div className="eyebrow text-blue">FAQ</div>
          <h2 className="font-display mt-4 text-[clamp(38px,4.6vw,60px)] leading-[1.02] font-extrabold">
            Questions, answered.
          </h2>
          <p className="text-muted mt-[18px] text-[17px] leading-[1.6]">
            Something else on your mind? Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue font-semibold hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              className="faq rounded-[22px] bg-white px-6 py-[22px]"
              data-rv
              data-d={Math.min(i + 1, 5)}
            >
              <summary className="flex items-center justify-between gap-4 text-lg font-semibold">
                {f.q}
                <span
                  className="plus bg-mist inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[22px]"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="ans text-muted mt-3 text-base leading-[1.6]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
