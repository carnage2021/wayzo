import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background, C, FPS, springAt } from "../brand";
import { KineticText } from "../components/KineticText";

/** Three real moments, ~8 s: splash, ticket drop, AI result / dashboard. */
export const HOOK_CUTS = [
  { src: "raw/S5-splash-signup.mp4", from: 2.0, len: 2.2, line: ["Open *wayzo.*"] },
  { src: "raw/S7-upload-flight.mp4", from: 2.7, len: 2.0, line: ["Drop a *ticket.*"] },
  { src: "raw/S7-upload-flight.mp4", from: 62.9, len: 1.8, line: ["AI *reads* it."] },
  { src: "raw/S7-timeline-dashboard.mp4", from: 19.9, len: 2.2, line: ["Your trip, *sorted.*"] },
];
export const HOOK_DURATION = Math.round(HOOK_CUTS.reduce((a, c) => a + c.len, 0) * FPS);

export function S1Hook() {
  const frame = useCurrentFrame();
  let at = 0;
  return (
    <AbsoluteFill>
      <Background glow="both" />
      {HOOK_CUTS.map((c, i) => {
        const start = Math.round(at * FPS);
        at += c.len;
        const p = springAt(frame - start, 0, { damping: 16, stiffness: 150 });
        return (
          <Sequence key={i} from={start} durationInFrames={Math.round(c.len * FPS)}>
            <div style={{ position: "absolute", left: 160, top: 70, width: 1600, height: 900, borderRadius: 28, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,.45)", background: C.ink2, transform: `scale(${0.94 + 0.06 * Math.min(1, p)})` }}>
              <OffthreadVideo src={staticFile(c.src)} startFrom={Math.round(c.from * FPS)} muted style={{ width: 1600, height: 900 }} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 40 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ background: C.ink, borderRadius: 22, padding: "8px 30px 14px" }}>
                  <KineticText lines={c.line} at={0.05} size={64} />
                </div>
              </div>
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
