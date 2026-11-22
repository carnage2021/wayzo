"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ROUTE_PATH } from "@/components/ui/logo";

const SPLASH_MS = 1400; // ≤ 1.5s per FEATURES.md F2

/** design/splash-screen.html, played once and compressed to 1.4s, then the curtain lifts. */
export default function PwaSplash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), SPLASH_MS);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          aria-hidden
          className="bg-ink fixed inset-0 z-[200] flex flex-col items-center justify-center gap-[22px] overflow-hidden bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[length:39px_39px] text-white"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="pointer-events-none absolute size-[420px] rounded-full bg-[radial-gradient(circle,rgba(59,91,255,.32),rgba(59,91,255,0)_65%)]" />
          <div className="border-lime/30 pointer-events-none absolute size-[300px] animate-[spin_16s_linear_infinite] rounded-full border-[1.5px] border-dashed" />
          <motion.div
            className="bg-lime relative flex size-[112px] items-center justify-center rounded-[36px] shadow-[0_24px_60px_rgba(215,255,61,.25)]"
            initial={{ opacity: 0, scale: 0.3, rotate: -25 }}
            animate={{ opacity: 1, scale: [0.3, 1.08, 1], rotate: [-25, 3, 0] }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.3, 1] }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0B1020"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d={ROUTE_PATH}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.65, 0, 0.35, 1] }}
              />
            </svg>
          </motion.div>
          <div className="font-display relative flex overflow-hidden pb-1.5 text-[60px] leading-none font-extrabold !tracking-[-0.03em]">
            {"wayzo".split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: "70%" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <motion.div
            className="relative text-base font-medium text-white/75"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.55 }}
          >
            Upload tickets. Travel easy.
          </motion.div>
          <div className="absolute inset-x-0 bottom-[72px] flex flex-col items-center gap-3.5">
            <div className="h-1 w-[120px] overflow-hidden rounded bg-white/[.12]">
              <motion.div
                className="bg-lime h-full rounded"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
              />
            </div>
            <div className="text-xs font-semibold tracking-[.14em] text-white/60 uppercase">
              Planning your next trip
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
