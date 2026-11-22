"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DialogOverlay } from "./dialog";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetTitle = SheetPrimitive.Title;
export const SheetDescription = SheetPrimitive.Description;

const sideClasses = {
  right:
    "inset-y-0 right-0 h-full w-[min(420px,100%)] rounded-l-[28px] data-[state=open]:animate-[sheet-right_.3s_cubic-bezier(.2,.7,.2,1)]",
  left: "inset-y-0 left-0 h-full w-[min(320px,100%)] rounded-r-[28px] data-[state=open]:animate-[sheet-left_.3s_cubic-bezier(.2,.7,.2,1)]",
  bottom:
    "inset-x-0 bottom-0 max-h-[90dvh] rounded-t-[28px] data-[state=open]:animate-[sheet-bottom_.3s_cubic-bezier(.2,.7,.2,1)]",
} as const;

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof sideClasses }) {
  return (
    <SheetPrimitive.Portal>
      <DialogOverlay />
      <SheetPrimitive.Content
        className={cn(
          "text-ink fixed z-50 flex flex-col gap-4 overflow-y-auto bg-white p-6 shadow-[0_40px_90px_rgba(11,16,32,.35)] outline-none",
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="bg-mist text-ink hover:bg-ink hover:text-lime absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full transition-colors">
          <X className="size-4" aria-hidden />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
