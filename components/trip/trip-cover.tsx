/* eslint-disable @next/next/no-img-element -- Unsplash requires hotlinking their URL as returned */
import { cn } from "@/lib/utils";
import { ROUTE_PATH } from "@/components/ui/logo";
import type { CoverCredit } from "@/lib/db/types";

const UNSPLASH_HOME = "https://unsplash.com/?utm_source=wayzo&utm_medium=referral";

/**
 * Trip cover: Unsplash photo (with photographer credit) when available, otherwise a branded ink-grid cover
 * with the destination in the display face (no gradients, per design system).
 */
export function TripCover({
  coverUrl,
  credit = null,
  linkCredit = false,
  creditPosition = "bottom",
  label,
  className,
  children,
}: {
  coverUrl: string | null;
  /** Unsplash attribution. Links only where the cover isn't already inside a link. */
  credit?: CoverCredit | null;
  linkCredit?: boolean;
  creditPosition?: "top" | "bottom";
  label: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("bg-ink relative overflow-hidden", className)}>
      {coverUrl ? (
        <>
          <img src={coverUrl} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          {/* Keeps white text ≥ 4.5:1 on any photo */}
          <div className="bg-ink/45 absolute inset-0" aria-hidden />
        </>
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[length:28px_28px]"
          aria-hidden
        >
          <svg
            className="text-lime/[.14] absolute -right-6 -bottom-8 h-[140%]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d={ROUTE_PATH} />
          </svg>
          <span className="font-display absolute bottom-3 left-4 max-w-[80%] truncate text-[28px] leading-none font-extrabold text-white/90">
            {label}
          </span>
        </div>
      )}
      {children}
      {coverUrl && credit && (
        <span
          className={cn(
            "absolute right-3 z-10 max-w-[calc(100%-24px)] truncate text-[11px] text-white/80",
            creditPosition === "top" ? "top-2.5" : "bottom-2",
          )}
        >
          {linkCredit ? (
            <>
              Photo by{" "}
              <a
                href={credit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {credit.name}
              </a>{" "}
              on{" "}
              <a
                href={UNSPLASH_HOME}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Unsplash
              </a>
            </>
          ) : (
            <>Photo by {credit.name} on Unsplash</>
          )}
        </span>
      )}
    </div>
  );
}
