"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";

/** Shows a one-off toast from a ?flag in the URL, then removes the flag from the URL. */
export function FlashToast({
  message,
  variant = "success",
}: {
  message: string;
  variant?: "success" | "error";
}) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (variant === "error") toast.error(message);
    else toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [message, variant, pathname, router]);
  return null;
}
