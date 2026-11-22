"use client";

import { useEffect } from "react";
import { getPostHog } from "@/lib/analytics";

/** Starts PostHog after hydration when NEXT_PUBLIC_POSTHOG_KEY is set. No-op otherwise. */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void getPostHog();
  }, []);
  return <>{children}</>;
}
