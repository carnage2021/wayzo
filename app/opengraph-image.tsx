import { ImageResponse } from "next/og";
import { ROUTE_PATH } from "@/components/ui/logo";

export const alt = "Wayzo — Upload your tickets. We'll run the trip.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Loads Bricolage Grotesque 800 for the OG headline; falls back to the default font offline. */
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  try {
    const text = encodeURIComponent("wayzo Upload your tickets. We'll run the trip.");
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@96,800&text=${text}`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; og-image)" } },
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const font = await loadDisplayFont();
  const family = font ? "Bricolage" : "sans-serif";
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#0B1020",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        color: "#FFFFFF",
        fontFamily: family,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            background: "#D7FF3D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="44"
            height="44"
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
        <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em" }}>wayzo</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 0.98,
          letterSpacing: "-0.03em",
        }}
      >
        <div>Upload your tickets.</div>
        <div style={{ color: "#D7FF3D" }}>We&apos;ll run the trip.</div>
      </div>
    </div>,
    {
      ...size,
      fonts: font ? [{ name: "Bricolage", data: font, weight: 800, style: "normal" }] : undefined,
    },
  );
}
