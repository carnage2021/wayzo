import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, staticFile } from "remotion";

/** Wayzo brand tokens (docs/DESIGN_SYSTEM.md). */
export const C = {
  ink: "#0B1020",
  ink2: "#151B2E",
  ink3: "#1F2740",
  lime: "#D7FF3D",
  blue: "#3B5BFF",
  white: "#FFFFFF",
  mist: "#F2F4F8",
  canvas: "#F7F8FC",
  line: "#DCE1EA",
  muted: "#4B5565",
  mutedDark: "#A3ACBE",
  success: "#1F7A3D",
};
export const DISPLAY = "Bricolage Grotesque";
export const BODY = "Inter";
export const FPS = 60;

loadFont({ family: DISPLAY, url: staticFile("fonts/bricolage-800.woff2"), weight: "800" });
loadFont({ family: BODY, url: staticFile("fonts/inter-var.woff2"), weight: "100 900" });

export const ROUTE_PATH = "M3.5 17.5c3-8.5 6-10.5 8.5-10.5s3 3 5 3 3.5-2.5 3.5-2.5";

/** Seconds -> frames at 60 fps. */
export const s = (sec: number) => Math.round(sec * FPS);

/** Spring progress (0..1, may overshoot) starting at `atSec`. Damping ~0.7 reads premium. */
export function springAt(frame: number, atSec: number, opts: { damping?: number; stiffness?: number; mass?: number } = {}) {
  return spring({
    frame: frame - s(atSec),
    fps: FPS,
    config: { damping: opts.damping ?? 15, stiffness: opts.stiffness ?? 140, mass: opts.mass ?? 0.9 },
  });
}

/** Eased 0..1 over [atSec, atSec + durSec]. */
export function ease(frame: number, atSec: number, durSec: number, curve = Easing.bezier(0.2, 0.7, 0.2, 1)) {
  return interpolate(frame, [s(atSec), s(atSec + durSec)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: curve,
  });
}

/** Navy ground with the subtle 56px grid and soft brand glows. */
export function Background({ glow = "blue" }: { glow?: "blue" | "lime" | "both" | "none" }) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.ink,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
    >
      {(glow === "blue" || glow === "both") && (
        <div style={{ position: "absolute", width: 1200, height: 1200, left: -380, top: -420, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,91,255,.30), rgba(59,91,255,0) 65%)" }} />
      )}
      {(glow === "lime" || glow === "both") && (
        <div style={{ position: "absolute", width: 1000, height: 1000, right: -320, bottom: -420, borderRadius: "50%", background: "radial-gradient(circle, rgba(215,255,61,.16), rgba(215,255,61,0) 65%)" }} />
      )}
    </AbsoluteFill>
  );
}

/** Lime rounded-square mark with the route line; `draw` 0..1 draws the line. */
export function LogoMark({ size, draw = 1, tone = "lime" }: { size: number; draw?: number; tone?: "lime" | "ink" }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.31,
        background: tone === "lime" ? C.lime : C.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <path
          d={ROUTE_PATH}
          pathLength={100}
          stroke={tone === "lime" ? C.ink : C.lime}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - draw)}
        />
      </svg>
    </div>
  );
}

export const displayStyle: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 800,
  letterSpacing: "-0.035em",
  lineHeight: 0.98,
};
