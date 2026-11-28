import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, BODY, C, DISPLAY, LogoMark, displayStyle, ease, springAt } from "../brand";
import { KineticText } from "./KineticText";

/** Full-frame title: eyebrow + kinetic headline + optional subline. */
export function TitleCard({ eyebrow, lines, sub, at = 0.2 }: { eyebrow?: string; lines: string[]; sub?: string; at?: number }) {
  const frame = useCurrentFrame();
  const e = ease(frame, at, 0.5);
  const sb = ease(frame, at + 0.6 + lines.join(" ").split(" ").length * 0.07, 0.6);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28 }}>
      <Background glow="both" />
      {eyebrow && (
        <div style={{ position: "relative", fontFamily: BODY, fontWeight: 700, fontSize: 26, letterSpacing: "0.16em", textTransform: "uppercase", color: C.lime, opacity: e }}>
          {eyebrow}
        </div>
      )}
      <KineticText lines={lines} at={at + 0.1} size={104} style={{ position: "relative" }} />
      {sub && (
        <div style={{ position: "relative", fontFamily: BODY, fontWeight: 500, fontSize: 36, color: "rgba(255,255,255,.78)", opacity: sb, transform: `translateY(${(1 - sb) * 18}px)` }}>
          {sub}
        </div>
      )}
    </AbsoluteFill>
  );
}

/** Lower third for the face cam (transparent background). */
export function LowerThird({ name, role }: { name: string; role: string }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inP = springAt(frame, 0.2, { damping: 16, stiffness: 140 });
  const out = interpolate(frame, [durationInFrames - 24, durationInFrames - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const w = interpolate(Math.min(inP, 1), [0, 1], [0, 1]);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 96, bottom: 110, display: "flex", alignItems: "center", gap: 20, opacity: 1 - out, transform: `translateX(${-out * 40}px)` }}>
        <div style={{ transform: `scale(${inP})` }}>
          <LogoMark size={86} draw={ease(frame, 0.35, 0.6)} />
        </div>
        <div style={{ overflow: "hidden", clipPath: `inset(0 ${100 - w * 100}% 0 0 round 24px)`, background: "rgba(11,16,32,.92)", borderRadius: 24, padding: "16px 30px 18px", border: "1px solid rgba(255,255,255,.12)" }}>
          <div style={{ ...displayStyle, fontSize: 46, color: C.white, whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: C.lime, marginTop: 6, whiteSpace: "nowrap" }}>{role}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** "Coming next" feature frame: title + body copy on the left, a mockup on the right. */
export function FeatureCard({ title, body, children, index }: { title: string[]; body: string; children: React.ReactNode; index?: string }) {
  const frame = useCurrentFrame();
  const badge = springAt(frame, 0.1, { damping: 14 });
  const copy = ease(frame, 0.9, 0.6);
  const mock = springAt(frame, 0.35, { damping: 15, stiffness: 110 });
  return (
    <AbsoluteFill>
      <Background glow="both" />
      <div style={{ position: "absolute", left: 130, top: 300, width: 760 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 20px", borderRadius: 999, background: C.lime, color: C.ink, fontFamily: BODY, fontWeight: 800, fontSize: 22, letterSpacing: "0.1em", transform: `scale(${badge})`, transformOrigin: "left center" }}>
          COMING NEXT{index ? ` · ${index}` : ""}
        </div>
        <KineticText lines={title} at={0.3} size={88} align="left" style={{ marginTop: 34 }} />
        <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 32, lineHeight: 1.45, color: "rgba(255,255,255,.78)", marginTop: 30, opacity: copy, transform: `translateY(${(1 - copy) * 16}px)` }}>
          {body}
        </div>
      </div>
      <div style={{ position: "absolute", left: 980, top: 120, width: 820, height: 840, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - Math.min(mock, 1)) * 80}px)`, opacity: Math.min(1, mock * 1.4) }}>
        {children}
      </div>
    </AbsoluteFill>
  );
}

/** Callout pill (transparent overlays). */
export function Callout({ label, x, y, at, tone = "ink" }: { label: string; x: number; y: number; at: number; tone?: "ink" | "lime" }) {
  const frame = useCurrentFrame();
  const p = springAt(frame, at, { damping: 13, stiffness: 170 });
  if (p <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${p})`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 26px 14px 18px",
        borderRadius: 999,
        background: tone === "lime" ? C.lime : C.ink,
        color: tone === "lime" ? C.ink : C.white,
        fontFamily: BODY,
        fontWeight: 800,
        fontSize: 30,
        boxShadow: "0 20px 50px rgba(0,0,0,.35)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 14, height: 14, borderRadius: "50%", background: tone === "lime" ? C.ink : C.lime }} />
      {label}
    </div>
  );
}

/** Simple timed captions: [{ from, to, text }] in seconds, bottom centre. */
export function Captions({ lines }: { lines: { from: number; to: number; text: string }[] }) {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const cur = lines.find((l) => t >= l.from && t < l.to);
  if (!cur) return null;
  const p = Math.min(1, (t - cur.from) / 0.15);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, textAlign: "center", opacity: p }}>
      <span style={{ display: "inline-block", padding: "12px 26px 14px", borderRadius: 18, background: "rgba(11,16,32,.86)", color: C.white, fontFamily: BODY, fontWeight: 700, fontSize: 40 }}>
        {cur.text}
      </span>
    </div>
  );
}

/** Lime-then-ink curtain wipe used between scenes (place at the cut, 0.7 s). */
export function Transition() {
  const frame = useCurrentFrame();
  const a = ease(frame, 0, 0.35);
  const b = ease(frame, 0.08, 0.35);
  const outA = ease(frame, 0.38, 0.32);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: C.lime, transform: `translateY(${(1 - a) * 100 - outA * 100}%)` }} />
      <AbsoluteFill style={{ background: C.ink, transform: `translateY(${(1 - b) * 100 - outA * 104}%)`, borderBottom: `22px solid ${C.lime}` }} />
    </AbsoluteFill>
  );
}

/** The splash-style logo sting: mark pops, route draws, letters rise. ~2 s. */
export function LogoSting() {
  const frame = useCurrentFrame();
  const mark = springAt(frame, 0.05, { damping: 11, stiffness: 160 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Background glow="blue" />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${mark}) rotate(${(1 - Math.min(mark, 1)) * -25}deg)` }}>
          <LogoMark size={170} draw={ease(frame, 0.2, 0.6)} />
        </div>
        <KineticText lines={["wayzo"]} at={0.3} stagger={0.05} size={190} />
      </div>
    </AbsoluteFill>
  );
}

/** End screen with empty subscribe + next-video slots (20 s). */
export function EndScreen() {
  const frame = useCurrentFrame();
  const slot = ease(frame, 1.4, 0.7);
  const ring = frame * 0.08;
  return (
    <AbsoluteFill>
      <Background glow="both" />
      <div style={{ position: "absolute", left: 960 - 520, top: 330 - 520, width: 1040, height: 1040, borderRadius: "50%", border: "2px dashed rgba(215,255,61,.25)", transform: `rotate(${ring}deg)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <LogoMark size={120} draw={ease(frame, 0.2, 0.6)} />
          <KineticText lines={["wayzo"]} at={0.25} stagger={0.05} size={140} />
        </div>
        <KineticText lines={["Upload tickets. *Travel* *easy.*"]} at={0.8} size={58} />
      </div>
      {/* Empty slots for YouTube's end-screen elements */}
      <div style={{ position: "absolute", left: 300, top: 600, width: 560, height: 315, borderRadius: 26, border: "3px dashed rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,.6)", opacity: slot }}>
        Next video
      </div>
      <div style={{ position: "absolute", left: 1150, top: 640, width: 236, height: 236, borderRadius: "50%", border: "3px dashed rgba(215,255,61,.55)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BODY, fontWeight: 700, fontSize: 26, color: C.lime, opacity: slot, textAlign: "center" }}>
        Subscribe
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,.7)", opacity: slot }}>
        Building it in public. See you in the next one.
      </div>
    </AbsoluteFill>
  );
}
