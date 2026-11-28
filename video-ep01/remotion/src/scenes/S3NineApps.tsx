import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background, C, DISPLAY, BODY, LogoMark, ease, s, springAt } from "../brand";
import { KineticText } from "../components/KineticText";

/** S3 "nine apps": the apps a group trip lives in today, crossed out, collapsing into one trip on wayzo. 12 s. */
export const NINE_APPS_DURATION = s(12);

// Labels and tilts from the landing page's problem section.
const CHIPS: { label: string; x: number; y: number; tilt: number }[] = [
  { label: "Booking emails", x: 330, y: 470, tilt: -3 },
  { label: "23 screenshots", x: 760, y: 440, tilt: 2 },
  { label: "Saved reels", x: 1150, y: 478, tilt: -1 },
  { label: "Group chat chaos", x: 1560, y: 450, tilt: 3 },
  { label: "Budget spreadsheet", x: 430, y: 640, tilt: -2 },
  { label: "Map pins", x: 880, y: 625, tilt: 1 },
  { label: "15 browser tabs", x: 1230, y: 655, tilt: -3 },
  { label: "Notes app", x: 1580, y: 625, tilt: 2 },
  { label: "Split-the-bill app", x: 940, y: 810, tilt: -1 },
];
const STRIKE_GROUPS = [[0, 1], [2, 3], [4, 5], [6, 7, 8]];
const STRIKE_AT = 3.4; // then every 0.6 s
const COLLAPSE_AT = 6.2;
const CARD_AT = 6.6;
const CENTER = { x: 960, y: 640 };

function Chip({ label, x, y, tilt, index }: (typeof CHIPS)[number] & { index: number }) {
  const frame = useCurrentFrame();
  const enter = springAt(frame, 0.9 + index * 0.08, { damping: 13, stiffness: 150 });
  const group = STRIKE_GROUPS.findIndex((g) => g.includes(index));
  const strike = ease(frame, STRIKE_AT + group * 0.6, 0.28, Easing.bezier(0.3, 0.8, 0.3, 1));
  const collapse = ease(frame, COLLAPSE_AT + index * 0.02, 0.5, Easing.bezier(0.55, 0, 0.9, 0.4));
  const dx = (CENTER.x - x) * collapse;
  const dy = (CENTER.y - y) * collapse;
  const scale = interpolate(enter, [0, 1], [0.6, 1]) * (1 - 0.8 * collapse);
  const opacity = Math.min(1, enter) * (1 - 0.55 * strike) * (1 - collapse);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy + (1 - Math.min(enter, 1)) * 40}px) rotate(${tilt * Math.min(enter, 1)}deg) scale(${scale})`,
        opacity,
        padding: "22px 34px",
        borderRadius: 999,
        background: "rgba(255,255,255,.07)",
        border: "1.5px solid rgba(255,255,255,.18)",
        color: C.white,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 36,
        whiteSpace: "nowrap",
        filter: collapse > 0 ? `blur(${collapse * 6}px)` : undefined,
      }}
    >
      {label}
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: "50%",
          height: 6,
          marginTop: -3,
          borderRadius: 4,
          background: C.lime,
          transform: `scaleX(${strike})`,
          transformOrigin: "left center",
          boxShadow: "0 0 18px rgba(215,255,61,.45)",
        }}
      />
    </div>
  );
}

export function S3NineApps() {
  const frame = useCurrentFrame();
  const card = springAt(frame, CARD_AT, { damping: 12, stiffness: 160 });
  const ring = ease(frame, CARD_AT - 0.1, 1.2);
  const sub = ease(frame, CARD_AT + 0.9, 0.6);
  return (
    <AbsoluteFill>
      <Background glow="both" />
      <KineticText lines={["One trip shouldn't", "need *nine* *apps.*"]} at={0.15} size={112} style={{ position: "absolute", top: 110, left: 0, right: 0 }} />

      {CHIPS.map((c, i) => (
        <Chip key={c.label} {...c} index={i} />
      ))}

      {/* Dashed orbit behind the card, turning slowly */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x - 360,
          top: CENTER.y - 360,
          width: 720,
          height: 720,
          borderRadius: "50%",
          border: "2px dashed rgba(215,255,61,.32)",
          opacity: ring,
          transform: `scale(${0.7 + 0.3 * ring}) rotate(${frame * 0.12}deg)`,
        }}
      >
        <div style={{ position: "absolute", top: -14, left: 346, width: 28, height: 28, borderRadius: "50%", background: C.lime }} />
      </div>

      {/* One trip on wayzo */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x,
          top: CENTER.y,
          transform: `translate(-50%, -50%) scale(${interpolate(card, [0, 1], [0.35, 1])})`,
          opacity: Math.min(1, card * 1.6),
          display: "flex",
          alignItems: "center",
          gap: 38,
          padding: "44px 64px 44px 48px",
          borderRadius: 44,
          background: C.lime,
          color: C.ink,
          boxShadow: "0 22px 60px rgba(215,255,61,.35)",
        }}
      >
        <LogoMark size={128} tone="ink" draw={ease(frame, CARD_AT + 0.2, 0.7)} />
        <div>
          <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 38 }}>One trip on</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 118, letterSpacing: "-0.04em", lineHeight: 0.95 }}>wayzo</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 880,
          textAlign: "center",
          fontFamily: BODY,
          fontWeight: 500,
          fontSize: 34,
          color: "rgba(255,255,255,.78)",
          opacity: sub,
          transform: `translateY(${(1 - sub) * 20}px)`,
        }}
      >
        Tickets, stays, the plan and the money. Together.
      </div>
    </AbsoluteFill>
  );
}
