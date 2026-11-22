"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Loaded only on an actual PWA launch, so `motion` never ships to regular visitors.
const PwaSplash = dynamic(() => import("./pwa-splash"), { ssr: false });

const SPLASH_KEY = "wayzo:splash-shown";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * - Registers the service worker (production only).
 * - Shows the app splash once per PWA launch: never in a browser tab, never on in-app navigation,
 *   never with prefers-reduced-motion.
 */
export function PwaRuntime() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    }
    if (!isStandalone() || sessionStorage.getItem(SPLASH_KEY)) return;
    sessionStorage.setItem(SPLASH_KEY, "1");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShowSplash(true);
  }, []);

  return showSplash ? <PwaSplash /> : null;
}
