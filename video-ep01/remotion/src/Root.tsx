import React from "react";
import { Composition, staticFile } from "remotion";
import { FPS } from "./brand";
import { ClipLog, StyledClip, timelineDuration } from "./components/StyledClip";
import { EndScreen, LogoSting, LowerThird } from "./components/kit";
import { REAL_CLIPS, RoughCut, loadLogs, roughCutDuration } from "./RoughCut";
import { HOOK_DURATION, S1Hook } from "./scenes/S1Hook";
import { NINE_APPS_DURATION, S3NineApps } from "./scenes/S3NineApps";
import { S3GroupChat, S3Versus, S4ThreeSteps, S7Callouts, S8Brief, S8Expenses, S8Plan, S8Quiz, S8Stays, S8WhatsApp } from "./scenes/graphics";

const HD = { fps: FPS, width: 1920, height: 1080 } as const;
const sec = (n: number) => Math.round(n * FPS);
const GRAPHICS: [string, React.FC, number][] = [
  ["S1-hook", S1Hook, HOOK_DURATION],
  ["S1-sting", LogoSting, sec(2)],
  ["S2-lowerthird", () => <LowerThird name="Mirage" role="Founder, Wayzo" />, sec(6)],
  ["S3-nine-apps", S3NineApps, NINE_APPS_DURATION],
  ["S3-group-chat", S3GroupChat, sec(8)],
  ["S3-versus", S3Versus, sec(6)],
  ["S4-three-steps", S4ThreeSteps, sec(10)],
  ["S7-callouts", S7Callouts, sec(6)],
  ["S8-coming-next-1-quiz", S8Quiz, sec(10)],
  ["S8-coming-next-2-stays", S8Stays, sec(10)],
  ["S8-coming-next-3-plan", S8Plan, sec(10)],
  ["S8-coming-next-4-expenses", S8Expenses, sec(10)],
  ["S8-coming-next-5-brief", S8Brief, sec(10)],
  ["S8-coming-next-6-whatsapp", S8WhatsApp, sec(10)],
  ["S9-endscreen", EndScreen, sec(20)],
];

const Styled: React.FC<{ name: string; log?: ClipLog }> = ({ name, log }) => (log ? <StyledClip src={`raw/${name}.mp4`} log={log} /> : null);

export const RemotionRoot: React.FC = () => (
  <>
    {GRAPHICS.map(([id, C, d]) => (
      <Composition key={id} id={id} component={C} durationInFrames={d} {...HD} />
    ))}
    {REAL_CLIPS.map((name) => (
      <Composition
        key={name}
        id={`${name}-styled`}
        component={Styled}
        defaultProps={{ name } as { name: string; log?: ClipLog }}
        durationInFrames={60}
        {...HD}
        calculateMetadata={async ({ props }) => {
          const log: ClipLog = await (await fetch(staticFile(`raw/${props.name}.json`))).json();
          return { durationInFrames: timelineDuration(log), props: { ...props, log } };
        }}
      />
    ))}
    <Composition
      id="rough-cut"
      component={RoughCut}
      defaultProps={{ logs: {} }}
      durationInFrames={60}
      {...HD}
      calculateMetadata={async () => {
        const logs = await loadLogs(REAL_CLIPS);
        return { durationInFrames: roughCutDuration(logs), props: { logs } };
      }}
    />
  </>
);
