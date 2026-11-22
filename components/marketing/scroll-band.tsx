/** Two giant text rows that slide in opposite directions as you scroll (--sy × 0.28). */
export function ScrollBand() {
  return (
    <section aria-hidden="true" className="overflow-hidden bg-white pt-6 pb-24">
      <div className="band-l font-display text-outline text-[clamp(64px,10vw,150px)] leading-none font-extrabold whitespace-nowrap">
        Upload tickets ✦ Get a plan ✦ Travel easy ✦ Upload tickets ✦
      </div>
      <div className="band-r font-display text-ink mt-2 text-[clamp(64px,10vw,150px)] leading-none font-extrabold whitespace-nowrap">
        Stays ✦ Food ✦ Plans ✦ Budgets ✦ <span className="text-blue">Morning briefs</span> ✦ Stays ✦ Food ✦
      </div>
    </section>
  );
}
