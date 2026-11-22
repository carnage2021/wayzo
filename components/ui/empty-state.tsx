import * as React from "react";
import { cn } from "@/lib/utils";

/** Designed empty state: icon tile, display title, short copy, optional action. */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "light",
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[28px] border-[1.5px] border-dashed px-6 py-14 text-center",
        tone === "light" ? "border-[#C9D0DD] bg-white" : "bg-ink-2 border-white/15 text-white",
        className,
      )}
    >
      {icon && (
        <span className="bg-lime text-ink inline-flex size-14 items-center justify-center rounded-[18px] [&_svg]:size-6">
          {icon}
        </span>
      )}
      <div className="flex max-w-sm flex-col gap-2">
        <h3 className="font-display text-[22px] leading-tight font-bold">{title}</h3>
        {description && (
          <p
            className={cn("text-[15px] leading-relaxed", tone === "light" ? "text-muted" : "text-muted-dark")}
          >
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
