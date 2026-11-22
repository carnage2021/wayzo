import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS applies its own rounding, so render the mark on a full-bleed ink field. */
export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} padding={28} />, size);
}
