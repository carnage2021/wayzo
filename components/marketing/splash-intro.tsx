import { ROUTE_PATH } from "@/components/ui/logo";

/** Landing splash: mark pops, route draws, letters rise, then ink + lime curtains lift. Pure CSS. */
export function SplashIntro() {
  return (
    <>
      <div className="splash2 bg-lime fixed inset-0 z-[99]" aria-hidden="true" />
      <div
        className="splash bg-ink fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5"
        aria-hidden="true"
      >
        <div className="mark-in bg-lime flex size-24 items-center justify-center rounded-[30px]">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B1020"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="draw" pathLength={100} d={ROUTE_PATH} />
          </svg>
        </div>
        <div className="font-display overflow-hidden pb-1.5 text-[64px] leading-none font-extrabold text-white">
          <span className="ltr l1">w</span>
          <span className="ltr l2">a</span>
          <span className="ltr l3">y</span>
          <span className="ltr l4">z</span>
          <span className="ltr l5">o</span>
        </div>
        <div className="tag-in text-base tracking-[.02em] text-white/70">Upload tickets. Travel easy.</div>
      </div>
    </>
  );
}
