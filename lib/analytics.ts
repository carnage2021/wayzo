"use client";

import type { PostHog } from "posthog-js";
import { publicEnv } from "@/lib/env";

/** Product events from FEATURES.md (non-functional). Extend as phases land. */
export type AnalyticsEvent =
  | "waitlist_joined"
  | "signed_in"
  | "onboarding_completed"
  | "trip_created"
  | "ticket_uploaded"
  | "ticket_parsed"
  | "quiz_completed"
  | "plan_generated"
  | "stay_clicked"
  | "expense_added"
  | "brief_opened"
  | "story_shared";

let client: Promise<PostHog | null> | null = null;

/** Lazily loads + initialises PostHog only when a key is configured (keeps it out of the main bundle). */
export function getPostHog(): Promise<PostHog | null> {
  if (!publicEnv.posthogKey || typeof window === "undefined") return Promise.resolve(null);
  client ??= import("posthog-js").then(({ default: posthog }) => {
    if (!posthog.__loaded) {
      posthog.init(publicEnv.posthogKey, {
        api_host: publicEnv.posthogHost,
        capture_pageview: "history_change",
        capture_pageleave: true,
        person_profiles: "identified_only",
        respect_dnt: true,
        // Never record ticket contents or form values.
        session_recording: { maskAllInputs: true },
        autocapture: { dom_event_allowlist: ["click", "submit"] },
      });
    }
    return posthog;
  });
  return client;
}

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean | null>) {
  void getPostHog().then((ph) => ph?.capture(event, props));
}
