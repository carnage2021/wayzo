"use client";

import { Toaster as Sonner } from "sonner";

/** App toaster: dark pill toasts with lime action, matching the design language. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset={24}
      mobileOffset={{ bottom: 88 }}
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-2xl bg-ink px-4 py-3.5 text-[15px] text-white shadow-float sm:min-w-[340px]",
          title: "font-semibold",
          description: "text-[13px] text-muted-dark",
          actionButton:
            "ml-auto rounded-full bg-lime px-3.5 py-1.5 text-[13px] font-bold text-ink transition-transform hover:-translate-y-0.5",
          cancelButton: "ml-auto rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-semibold text-white",
          success: "[&_[data-icon]]:text-lime",
          error: "[&_[data-icon]]:text-[#FF8A7A]",
          icon: "shrink-0",
        },
      }}
    />
  );
}

export { toast } from "sonner";
