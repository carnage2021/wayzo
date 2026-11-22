import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pill buttons per DESIGN_SYSTEM.md: lift 2px + glow on hover, scale .98 on press.
 * lime = on dark · ink = on light · ghost = outline on dark · outline = outline on light.
 */
const buttonVariants = cva(
  "group/btn inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-out-soft select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        lime: "bg-lime text-ink hover:shadow-lime",
        ink: "bg-ink text-white hover:shadow-ink",
        ghost: "border-[1.5px] border-white/25 bg-white/[.04] text-white hover:border-white",
        outline: "border-[1.5px] border-line bg-white text-ink hover:border-ink",
        soft: "bg-mist text-ink hover:bg-[#E8EBF2]",
        danger: "bg-error text-white hover:shadow-[0_14px_36px_rgba(180,35,24,.28)]",
        link: "h-auto min-h-0 rounded-none px-0 text-blue underline-offset-4 hover:translate-y-0 hover:underline",
      },
      size: {
        default: "min-h-[52px] px-[26px] text-base",
        lg: "min-h-[58px] px-7 text-[17px]",
        compact: "min-h-11 px-5 text-[15px]",
        sm: "min-h-9 px-4 text-sm",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "ink", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="size-[18px] animate-spin" aria-hidden />}
          {children}
        </>
      )}
    </Comp>
  );
}

/** Arrow that slides 4px on button hover. */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-[18px] transition-transform duration-300 group-hover/btn:translate-x-1", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export { buttonVariants };
