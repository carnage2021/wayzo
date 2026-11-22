import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { autocompleteDestinations, isPlacesConfigured } from "@/lib/places/geoapify";
import { createRateLimiter } from "@/lib/rate-limit";

const schema = z.object({ input: z.string().trim().min(2).max(100) });
const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

/** POST /api/places/autocomplete — signed-in users only (protects the free daily quota). */
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isPlacesConfigured()) return NextResponse.json({ configured: false, suggestions: [] });
  if (!limiter(user.id).allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ configured: true, suggestions: [] });

  try {
    const suggestions = await autocompleteDestinations(parsed.data.input);
    return NextResponse.json({ configured: true, suggestions });
  } catch (e) {
    console.error("[places] autocomplete failed", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { configured: true, suggestions: [], error: "Search is unavailable" },
      { status: 502 },
    );
  }
}
