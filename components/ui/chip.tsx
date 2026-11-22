import * as React from "react";
import { cn } from "@/lib/utils";

/** Selectable chip: 44px pill, outline; selected = ink fill, white text; aria-pressed. */
export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  selected?: boolean;
  tone?: "light" | "dark";
}

export function Chip({ selected = false, tone = "light", className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] px-[18px] text-[15px] font-semibold transition-all duration-250",
        tone === "light" &&
          (selected
            ? "border-ink bg-ink text-white"
            : "border-line hover:border-ink bg-white text-[#3A4254]"),
        tone === "dark" &&
          (selected
            ? "border-lime bg-lime text-ink"
            : "border-white/20 bg-transparent text-white hover:border-white/60"),
        className,
      )}
      {...props}
    />
  );
}

/** Static, non-interactive tag (e.g. "Coming soon"). */
export function Tag({
  className,
  variant = "lime",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "lime" | "ink" | "mist" | "blue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-bold",
        variant === "lime" && "bg-lime text-ink",
        variant === "ink" && "bg-ink text-white",
        variant === "mist" && "bg-mist text-muted",
        variant === "blue" && "bg-[#EEF1FF] text-[#2A44D6]",
        className,
      )}
      {...props}
    />
  );
}
