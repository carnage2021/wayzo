import React from "react";
import { useCurrentFrame } from "remotion";
import { C, displayStyle, springAt } from "../brand";

/**
 * Words rising through masks on a spring. Lines are arrays of words; a word wrapped
 * in *stars* is highlighted (lime by default).
 */
export function KineticText({
  lines,
  at = 0,
  stagger = 0.07,
  size = 100,
  color = C.white,
  highlight = C.lime,
  align = "center",
  style,
}: {
  lines: string[];
  at?: number;
  stagger?: number;
  size?: number;
  color?: string;
  highlight?: string;
  align?: "left" | "center";
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  let i = 0;
  return (
    <div style={{ ...displayStyle, fontSize: size, color, textAlign: align, ...style }}>
      {lines.map((line, li) => (
        <div key={li} style={{ display: "block" }}>
          {line.split(" ").map((raw, wi) => {
            const hl = /^\*.*\*[.,!?]?$/.test(raw);
            const word = raw.replace(/\*/g, "");
            const p = springAt(frame, at + i++ * stagger, { damping: 16, stiffness: 120 });
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0 0.04em 0.14em", margin: "0 -0.04em -0.14em" }}>
                <span style={{ display: "inline-block", transform: `translateY(${(1 - Math.min(p, 1.02)) * 115}%)`, color: hl ? highlight : undefined }}>
                  {word}
                </span>
                {wi < line.split(" ").length - 1 ? " " : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
