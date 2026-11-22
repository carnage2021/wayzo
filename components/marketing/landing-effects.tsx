"use client";

import { useLandingScroll } from "@/lib/hooks/use-landing-scroll";

/** Mounts the landing page scroll logic. Renders nothing. */
export function LandingEffects() {
  useLandingScroll();
  return null;
}
