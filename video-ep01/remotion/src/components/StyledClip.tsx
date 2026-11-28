import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background, BODY, C, FPS } from "../brand";

/** Recorder log (video-ep01/raw/<clip>.json). Coordinates are in a 1920x1080 frame. */
export type ClipEvent = { type: string; t: number; end?: number; x?: number; y?: number; label?: string; result?: string };
export type ClipLog = { duration: number; events: ClipEvent[] };

type Segment = { src0: number; src1: number; rate: number; out0: number; out1: number };

/** Splits the source into normal-speed parts and sped-up AI waits (honestly labelled on screen). */
export function buildTimeline(log: ClipLog, speed = 8): Segment[] {
  const waits: [number, number][] = [];
  let open: number | null = null;
  for (const e of log.events) {
    if (e.type === "wait-start") open = e.t + 1.2; // let the "Reading" state be seen at normal speed
    if (e.type === "wait-end" && open !== null) {
      if (e.t - 0.6 > open + 2) waits.push([open, e.t - 0.6]);
      open = null;
    }
  }
  const segs: Segment[] = [];
  let cursor = 0;
  let out = 0;
  const push = (a: number, b: number, rate: number) => {
    if (b <= a) return;
    const len = (b - a) / rate;
    segs.push({ src0: a, src1: b, rate, out0: out, out1: out + len });
    out += len;
  };
  for (const [a, b] of waits) {
    push(cursor, a, 1);
    push(a, b, speed);
    cursor = b;
  }
  push(cursor, log.duration, 1);
  return segs;
}

export function timelineDuration(log: ClipLog, speed = 8) {
  const segs = buildTimeline(log, speed);
  return Math.ceil(segs[segs.length - 1]!.out1 * FPS);
}

/** Source seconds -> output seconds. */
function toOut(segs: Segment[], t: number) {
  const s = segs.find((g) => t >= g.src0 && t <= g.src1) ?? segs[segs.length - 1]!;
  return s.out0 + (Math.min(Math.max(t, s.src0), s.src1) - s.src0) / s.rate;
}

const FRAME = { w: 1600, h: 900 };
const K = FRAME.w / 1920; // log coords -> frame coords

export function StyledClip({ src, log, speed = 8, zoom = 1.32 }: { src: string; log: ClipLog; speed?: number; zoom?: number }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const segs = buildTimeline(log, speed);
  const clicks = log.events.filter((e) => e.type === "click").map((e) => ({ ...e, o: toOut(segs, e.t) }));
  const typing = log.events.filter((e) => e.type === "typing").map((e) => ({ o0: toOut(segs, e.t), o1: toOut(segs, e.end ?? e.t) }));

  // Camera: ease toward each click; stay close while typing follows it.
  let z = 1;
  let fx = FRAME.w / 2;
  let fy = FRAME.h / 2;
  for (const c of clicks) {
    const typeAfter = typing.find((g) => g.o0 >= c.o - 0.2 && g.o0 <= c.o + 0.6);
    const holdEnd = Math.max(c.o + 1.1, typeAfter ? typeAfter.o1 + 0.4 : 0);
    const env = interpolate(t, [c.o - 0.55, c.o - 0.05, holdEnd, holdEnd + 0.6], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const eased = env < 0.5 ? 2 * env * env : 1 - Math.pow(-2 * env + 2, 2) / 2;
    if (eased > (z - 1) / (zoom - 1) - 1e-6) {
      z = 1 + (zoom - 1) * eased;
      fx = FRAME.w / 2 + ((c.x ?? 960) * K - FRAME.w / 2) * eased;
      fy = FRAME.h / 2 + ((c.y ?? 540) * K - FRAME.h / 2) * eased;
    }
  }
  // Keep the zoomed frame filled (no edges).
  const tx = Math.min(0, Math.max(FRAME.w - FRAME.w * z, FRAME.w / 2 - fx * z));
  const ty = Math.min(0, Math.max(FRAME.h - FRAME.h * z, FRAME.h / 2 - fy * z));
  const fast = segs.find((g) => g.rate > 1 && t >= g.out0 && t < g.out1);

  return (
    <AbsoluteFill>
      <Background glow="both" />
      <div
        style={{
          position: "absolute",
          left: (1920 - FRAME.w) / 2,
          top: (1080 - FRAME.h) / 2,
          width: FRAME.w,
          height: FRAME.h,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.08)",
          background: C.ink2,
        }}
      >
        <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
          {segs.map((g, i) => (
            <Sequence key={i} from={Math.round(g.out0 * FPS)} durationInFrames={Math.max(1, Math.round((g.out1 - g.out0) * FPS))} layout="none">
              <OffthreadVideo
                src={staticFile(src)}
                startFrom={Math.round(g.src0 * FPS)}
                playbackRate={g.rate}
                muted
                style={{ position: "absolute", inset: 0, width: FRAME.w, height: FRAME.h }}
              />
            </Sequence>
          ))}
          {clicks.map((c, i) => {
            const p = (t - c.o) / 0.55;
            if (p < 0 || p > 1) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: (c.x ?? 0) * K - 36,
                  top: (c.y ?? 0) * K - 36,
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  border: `${4 * (1 - p) + 1}px solid ${C.lime}`,
                  background: `rgba(215,255,61,${0.28 * (1 - p)})`,
                  transform: `scale(${0.35 + p * 1.1})`,
                  opacity: 1 - p * 0.9,
                }}
              />
            );
          })}
        </div>
      </div>
      {fast && (
        <div
          style={{
            position: "absolute",
            right: 160 + 24,
            top: 90 + 24,
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(11,16,32,.88)",
            color: C.lime,
            fontFamily: BODY,
            fontWeight: 700,
            fontSize: 22,
            border: "1px solid rgba(215,255,61,.4)",
          }}
        >
          AI reading · sped up ×{fast.rate}
        </div>
      )}
    </AbsoluteFill>
  );
}
