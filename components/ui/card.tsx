import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Cards: big radius, no left-border accents, no gradients. */
const cardVariants = cva("relative flex flex-col", {
  variants: {
    variant: {
      white: "border border-soft-line bg-white text-ink",
      mist: "bg-mist text-ink",
      ink: "bg-ink text-white",
      lime: "bg-lime text-ink",
      blue: "bg-blue text-white",
    },
    size: {
      sm: "gap-3 rounded-[18px] p-4",
      default: "gap-4 rounded-[28px] p-6",
      lg: "gap-5 rounded-[32px] p-8",
    },
    interactive: { true: "lift", false: "" },
  },
  defaultVariants: { variant: "white", size: "default", interactive: false },
});

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, variant, size, interactive, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant, size, interactive }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-xl leading-tight font-bold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted text-[15px] leading-relaxed", className)} {...props} />;
}
