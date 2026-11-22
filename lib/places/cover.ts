import "server-only";
import type { CoverCredit } from "@/lib/firebase/types";

/**
 * Trip cover photos from Unsplash (free; demo 50 req/h, 1,000 req/h after approval).
 * Unsplash rules we follow: hotlink their image URL as-is, credit the photographer
 * (with utm params), and ping the download endpoint when a photo is chosen.
 */
const UTM = "utm_source=wayzo&utm_medium=referral";

export function isCoverConfigured(): boolean {
  return Boolean(process.env.UNSPLASH_ACCESS_KEY);
}

type Photo = {
  urls?: { regular?: string };
  user?: { name?: string; links?: { html?: string } };
  links?: { download_location?: string };
};

export async function findCoverPhoto(query: string): Promise<{ url: string; credit: CoverCredit } | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key || !query.trim()) return null;
  const headers = { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" };

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", `${query} city`);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("per_page", "1");
  try {
    const res = await fetch(url, { headers, next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    const photo = ((await res.json()) as { results?: Photo[] }).results?.[0];
    const src = photo?.urls?.regular;
    const name = photo?.user?.name;
    const profile = photo?.user?.links?.html;
    if (!src || !name || !profile) return null;

    // Required by the Unsplash API guidelines; fire and forget.
    if (photo.links?.download_location) {
      void fetch(photo.links.download_location, { headers, cache: "no-store" }).catch(() => undefined);
    }
    return { url: src, credit: { name, url: `${profile}?${UTM}` } };
  } catch {
    return null;
  }
}
