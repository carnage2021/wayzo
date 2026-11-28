import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { BODY, C, FPS } from "./brand";
import { ClipLog, timelineDuration } from "./components/StyledClip";
import { Transition } from "./components/kit";
import { HOOK_DURATION } from "./scenes/S1Hook";
import { NINE_APPS_DURATION } from "./scenes/S3NineApps";
import { Slate } from "./scenes/graphics";

export const REAL_CLIPS = ["S4-landing-scroll", "S5-splash-signup", "S5-login", "S6-create-trip", "S7-upload-flight", "S7-upload-train", "S7-upload-hotel", "S7-timeline-dashboard"] as const;
export type Logs = Record<string, ClipLog>;

export async function loadLogs(names: readonly string[]): Promise<Logs> {
  const out: Logs = {};
  for (const n of names) out[n] = await (await fetch(staticFile(`raw/${n}.json`))).json();
  return out;
}

type Item = { el: React.ReactNode; frames: number; overlay?: React.ReactNode };
type Scene = { id: string; title: string; slot: number; talk: string; items: Item[] };

// The rough cut is a light assembly of the already-rendered 1080p files (render styled + graphics first).
const V = (file: string) => <OffthreadVideo src={staticFile(file)} muted transparent={file.endsWith(".mov")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />;
const g = (id: string, frames: number): Item => ({ el: V(`graphics/${id}.mp4`), frames });
const sec = (n: number) => Math.round(n * FPS);
const clip = (logs: Logs, name: string, overlay?: React.ReactNode): Item => ({
  el: V(`styled/${name}_styled.mp4`),
  frames: timelineDuration(logs[name]!),
  overlay,
});

/** Scene list at the brief's slot lengths (seconds). Real footage first, then a slate for the talking part. */
export function scenes(logs: Logs): Scene[] {
  const callouts = V("graphics/S7-callouts.mov");
  const s8 = ["1-quiz", "2-stays", "3-plan", "4-expenses", "5-brief", "6-whatsapp"].map((n) => g(`S8-coming-next-${n}`, sec(10)));
  return [
    { id: "S1", title: "Hook", slot: 30, talk: "Talk to camera: the hook", items: [g("S1-hook", HOOK_DURATION), g("S1-sting", sec(2))] },
    { id: "S2", title: "Who I am", slot: 45, talk: "Face cam: who I am (lower third on top)", items: [] },
    { id: "S3", title: "The problem", slot: 75, talk: "Talk: why group trips are messy", items: [g("S3-nine-apps", NINE_APPS_DURATION), g("S3-group-chat", sec(8)), g("S3-versus", sec(6))] },
    { id: "S4", title: "The idea", slot: 45, talk: "Talk: the idea", items: [clip(logs, "S4-landing-scroll"), g("S4-three-steps", sec(10))] },
    { id: "S5", title: "Demo · sign up + log in", slot: 45, talk: "", items: [clip(logs, "S5-splash-signup"), clip(logs, "S5-login")] },
    { id: "S6", title: "Demo · create a trip", slot: 60, talk: "", items: [clip(logs, "S6-create-trip")] },
    {
      id: "S7",
      title: "Demo · upload tickets",
      slot: 90,
      talk: "",
      items: [clip(logs, "S7-upload-flight", callouts), clip(logs, "S7-upload-train", callouts), clip(logs, "S7-upload-hotel"), clip(logs, "S7-timeline-dashboard")],
    },
    { id: "S8", title: "Coming next", slot: 75, talk: "Talk: what's next", items: s8 },
    { id: "S9", title: "Ending", slot: 45, talk: "Talk: outro", items: [g("S9-endscreen", sec(20))] },
  ];
}

/** Expands scenes into timed blocks, padding each to its slot with a slate. */
export function layout(logs: Logs) {
  const blocks: { scene: Scene; start: number; frames: number; el: React.ReactNode; overlay?: React.ReactNode }[] = [];
  let t = 0;
  for (const sc of scenes(logs)) {
    const used = sc.items.reduce((a, i) => a + i.frames, 0);
    const pad = Math.max(0, sc.slot * FPS - used);
    const items = [...sc.items];
    if (pad > FPS) items.push({ el: <Slate scene={`${sc.id} · ${sc.title}`} note={sc.talk || "VO over demo"} />, frames: pad });
    for (const it of items) {
      blocks.push({ scene: sc, start: t, frames: it.frames, el: it.el, overlay: it.overlay });
      t += it.frames;
    }
  }
  return { blocks, total: t };
}

export function roughCutDuration(logs: Logs) {
  return layout(logs).total;
}

export function RoughCut({ logs }: { logs: Logs }) {
  const { blocks } = layout(logs);
  const sceneStarts = blocks.filter((b, i) => i === 0 || blocks[i - 1]!.scene.id !== b.scene.id);
  const firstS2 = blocks.findIndex((x) => x.scene.id === "S2");
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      {blocks.map((b, i) => (
        <Sequence key={i} from={b.start} durationInFrames={b.frames}>
          {b.el}
          {b.overlay && <Sequence from={Math.max(0, b.frames - 6 * FPS)}>{b.overlay}</Sequence>}
          {i === firstS2 && <Sequence durationInFrames={6 * FPS}>{V("graphics/S2-lowerthird.mov")}</Sequence>}
          <div style={{ position: "absolute", left: 24, top: 20, padding: "6px 14px", borderRadius: 10, background: "rgba(0,0,0,.6)", color: "#fff", fontFamily: BODY, fontWeight: 700, fontSize: 22 }}>
            {b.scene.id} · {b.scene.title}
          </div>
        </Sequence>
      ))}
      {sceneStarts.slice(1).map((b, i) => (
        <Sequence key={`t${i}`} from={b.start - 21} durationInFrames={42}>
          <Transition />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
