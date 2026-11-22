import { ROUTE_PATH } from "@/components/ui/logo";

/**
 * Logo mark as plain JSX for next/og ImageResponse (Satori).
 * `padding` > 0 renders a maskable icon (mark inside the safe zone on an ink field).
 */
export function BrandMark({ size, padding = 0 }: { size: number; padding?: number }) {
  const inner = size - padding * 2;
  const mark = (
    <div
      style={{
        width: inner,
        height: inner,
        borderRadius: padding ? inner * 0.3 : size * 0.3,
        background: "#D7FF3D",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={inner * 0.6}
        height={inner * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#0B1020"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ROUTE_PATH} />
      </svg>
    </div>
  );
  if (!padding) return mark;
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0B1020",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {mark}
    </div>
  );
}
