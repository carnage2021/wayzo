"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input per DESIGN_SYSTEM.md: 58px tall, 16px radius, 1.5px line border, icon left;
 * focus → blue border + 4px ring at 14%; error → red border + shake.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
  icon?: React.ReactNode;
  invalid?: boolean;
  /** Increment to replay the shake (e.g. on each failed submit). */
  shakeSignal?: number;
  trailing?: React.ReactNode;
  wrapperClassName?: string;
}

export function Input({
  icon,
  invalid,
  shakeSignal,
  trailing,
  className,
  wrapperClassName,
  ...props
}: InputProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Restart the CSS shake without remounting (keeps focus), like the design's reflow trick.
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!invalid || !el) return;
    el.classList.remove("animate-shake");
    void el.offsetWidth;
    el.classList.add("animate-shake");
  }, [invalid, shakeSignal]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "border-line focus-within:border-blue flex min-h-[58px] items-center gap-3 rounded-2xl border-[1.5px] bg-white px-[18px] transition-[border-color,box-shadow] duration-250 focus-within:shadow-[0_0_0_4px_rgba(59,91,255,.14)]",
        invalid && "border-error-border focus-within:border-error-border",
        props.disabled && "bg-mist opacity-70",
        wrapperClassName,
      )}
    >
      {icon && (
        <span className="text-placeholder flex [&_svg]:size-5" aria-hidden>
          {icon}
        </span>
      )}
      <input
        aria-invalid={invalid || undefined}
        className={cn(
          "text-ink placeholder:text-placeholder h-[54px] min-w-0 flex-1 border-0 bg-transparent text-base outline-none disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "border-line text-ink placeholder:text-placeholder focus:border-blue min-h-28 w-full rounded-2xl border-[1.5px] bg-white px-[18px] py-4 text-base transition-[border-color,box-shadow] outline-none focus:shadow-[0_0_0_4px_rgba(59,91,255,.14)]",
        className,
      )}
      {...props}
    />
  );
}

export function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "border-line text-ink focus:border-blue h-[58px] w-full appearance-none rounded-2xl border-[1.5px] bg-white pr-11 pl-[18px] text-base transition-[border-color,box-shadow] outline-none focus:shadow-[0_0_0_4px_rgba(59,91,255,.14)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="text-placeholder pointer-events-none absolute top-1/2 right-[18px] size-4 -translate-y-1/2"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-ink text-sm font-semibold", className)} {...props} />;
}

export function FieldError({ id, children }: { id?: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <span id={id} role="alert" className="text-error text-[13px] font-medium">
      {children}
    </span>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <span className="text-subtle text-[13px]">{children}</span>;
}
