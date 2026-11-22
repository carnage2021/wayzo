import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-image";

/** PWA icons: /pwa-icon/192, /pwa-icon/512, /pwa-icon/maskable-512 */
const VARIANTS: Record<string, { size: number; padding: number }> = {
  "192": { size: 192, padding: 0 },
  "512": { size: 512, padding: 0 },
  "maskable-512": { size: 512, padding: 96 },
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const v = VARIANTS[variant];
  if (!v) return new Response("Not found", { status: 404 });
  return new ImageResponse(<BrandMark size={v.size} padding={v.padding} />, {
    width: v.size,
    height: v.size,
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
