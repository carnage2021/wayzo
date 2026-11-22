"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer bg-line data-[state=checked]:bg-ink inline-flex h-[30px] w-[52px] shrink-0 items-center rounded-full border-[1.5px] border-transparent p-0.5 transition-colors duration-200 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="ease-out-soft data-[state=checked]:bg-lime block size-[23px] rounded-full bg-white shadow-[0_2px_6px_rgba(11,16,32,.2)] transition-transform duration-200 data-[state=checked]:translate-x-[21px]" />
    </SwitchPrimitive.Root>
  );
}
