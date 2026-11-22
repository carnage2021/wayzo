import { cn } from "@/lib/utils";

export const ROUTE_PATH = "M3.5 17.5c3-8.5 6-10.5 8.5-10.5s3 3 5 3 3.5-2.5 3.5-2.5";

/** Logo mark: rounded square (radius ≈ 30%) with the wavy route line. */
export function LogoMark({
  size = 38,
  tone = "lime",
  className,
  strokeWidth = 2.4,
  pathClassName,
}: {
  size?: number;
  tone?: "lime" | "ink";
  className?: string;
  strokeWidth?: number;
  pathClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        tone === "lime" ? "bg-lime" : "bg-ink",
        className,
      )}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.31) }}
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        stroke={tone === "lime" ? "var(--ink)" : "var(--lime)"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path className={pathClassName} pathLength={pathClassName ? 100 : undefined} d={ROUTE_PATH} />
      </svg>
    </span>
  );
}

/** Mark + lowercase wordmark. */
export function Logo({
  size = 38,
  tone = "lime",
  textClassName,
  className,
}: {
  size?: number;
  tone?: "lime" | "ink";
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} tone={tone} />
      <span
        className={cn("font-display font-extrabold", textClassName)}
        style={{ fontSize: Math.round(size * 0.68) }}
      >
        wayzo
      </span>
    </span>
  );
}
