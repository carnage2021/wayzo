import "server-only";

/**
 * Destination search via Geoapify (OpenStreetMap data). Free plan: 3,000 requests/day,
 * commercial use allowed with attribution ("Powered by Geoapify", "© OpenStreetMap").
 * The key never reaches the browser; the client calls /api/places/autocomplete.
 */
const BASE = "https://api.geoapify.com";

export function isPlacesConfigured(): boolean {
  return Boolean(process.env.GEOAPIFY_API_KEY);
}

function key(): string {
  const k = process.env.GEOAPIFY_API_KEY;
  if (!k) throw new Error("GEOAPIFY_API_KEY missing");
  return k;
}

export type DestinationSuggestion = { place_id: string; name: string; secondary: string | null };
export type PlaceBasics = { place_id: string; name: string; lat: number; lng: number };

type AutocompleteResult = {
  place_id?: string;
  name?: string;
  city?: string;
  county?: string;
  state?: string;
  result_type?: string;
  country?: string;
  formatted?: string;
  address_line1?: string;
  lat?: number;
  lon?: number;
};

/**
 * Places we just showed in autocomplete, so createTrip can resolve the picked
 * place_id to coordinates without a second paid call (and without trusting the client).
 */
const recent = new Map<string, { basics: PlaceBasics; at: number }>();
const RECENT_TTL = 30 * 60_000;

function remember(b: PlaceBasics) {
  if (recent.size > 2000) recent.clear();
  recent.set(b.place_id, { basics: b, at: Date.now() });
}

/** Trip destinations can be cities, regions/islands (Bali, Tuscany) or whole countries. */
const DESTINATION_TYPES = new Set(["city", "county", "state", "country"]);

/** One retry for transient network errors (seen in practice as "fetch failed"). */
async function getJson<T>(url: URL): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error(`geoapify ${url.pathname} ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      if (attempt >= 1) throw e;
    }
  }
}

function geocodeUrl(endpoint: "autocomplete" | "search", text: string): URL {
  const url = new URL(`${BASE}/v1/geocode/${endpoint}`);
  url.searchParams.set("text", text);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("apiKey", key());
  return url;
}

function toSuggestions(results: AutocompleteResult[]): DestinationSuggestion[] {
  const seen = new Set<string>();
  const out: DestinationSuggestion[] = [];
  for (const r of results) {
    if (!r.place_id || !DESTINATION_TYPES.has(r.result_type ?? "")) continue;
    const name =
      r.result_type === "country"
        ? (r.country ?? r.name)
        : r.result_type === "state"
          ? (r.state ?? r.name)
          : (r.city ?? r.name ?? r.county);
    if (!name) continue;
    const dedupe = `${name.toLowerCase()}|${r.country ?? ""}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const secondary = [r.state, r.country].filter((p) => p && p !== name).join(", ") || null;
    if (typeof r.lat === "number" && typeof r.lon === "number") {
      remember({ place_id: r.place_id, name, lat: r.lat, lng: r.lon });
    }
    out.push({ place_id: r.place_id, name, secondary });
  }
  return out;
}

export async function autocompleteDestinations(input: string): Promise<DestinationSuggestion[]> {
  type Res = { results?: AutocompleteResult[] };
  const auto = toSuggestions((await getJson<Res>(geocodeUrl("autocomplete", input))).results ?? []);

  // Autocomplete favours cities; a full search also finds regions/islands such as "Bali".
  const q = input.trim().toLowerCase();
  if (q.length >= 3 && !auto.some((s) => s.name.toLowerCase() === q)) {
    const search = await getJson<Res>(geocodeUrl("search", input)).catch(() => ({ results: [] }) as Res);
    const extra = toSuggestions(search.results ?? []).filter(
      (s) => !auto.some((a) => a.name === s.name && a.secondary === s.secondary),
    );
    return [...extra, ...auto].slice(0, 6);
  }
  return auto.slice(0, 6);
}

const PLACE_ID_RE = /^[A-Za-z0-9_-]{10,400}$/;

/** Coordinates for a place id from autocomplete: recent cache first, then Place Details. */
export async function getPlaceBasics(placeId: string): Promise<PlaceBasics | null> {
  if (!PLACE_ID_RE.test(placeId)) return null;
  const hit = recent.get(placeId);
  if (hit && Date.now() - hit.at < RECENT_TTL) return hit.basics;

  const url = new URL(`${BASE}/v2/place-details`);
  url.searchParams.set("id", placeId);
  url.searchParams.set("lang", "en");
  url.searchParams.set("apiKey", key());
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    features?: {
      properties?: { name?: string; city?: string; lat?: number; lon?: number };
      geometry?: { type?: string; coordinates?: unknown };
    }[];
  };
  const f = data.features?.[0];
  const p = f?.properties;
  let lat = p?.lat;
  let lng = p?.lon;
  if ((typeof lat !== "number" || typeof lng !== "number") && f?.geometry?.type === "Point") {
    const c = f.geometry.coordinates as [number, number];
    [lng, lat] = c;
  }
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const basics = { place_id: placeId, name: p?.city ?? p?.name ?? "", lat, lng };
  remember(basics);
  return basics;
}

export type GeocodedPlace = {
  place_id: string;
  name: string;
  city: string | null;
  lat: number;
  lng: number;
  timezone: string | null;
};

/**
 * Best match for a free-text place from a ticket ("Hotel Lisboa Plaza, Lisbon", "Lisbon (LIS)").
 * Biased towards `near` (the trip destination) when known. Returns null when nothing matches.
 */
export async function geocodePlace(
  text: string,
  near?: { lat: number; lng: number } | null,
): Promise<GeocodedPlace | null> {
  const q = text.trim();
  if (q.length < 3) return null;
  const url = new URL(`${BASE}/v1/geocode/search`);
  url.searchParams.set("text", q.slice(0, 200));
  url.searchParams.set("limit", "1");
  url.searchParams.set("lang", "en");
  url.searchParams.set("format", "json");
  if (near) url.searchParams.set("bias", `proximity:${near.lng},${near.lat}`);
  url.searchParams.set("apiKey", key());
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 60 * 60 * 24 * 7 },
    });
    if (!res.ok) return null;
    const r = (
      (await res.json()) as {
        results?: (AutocompleteResult & { timezone?: { name?: string }; rank?: { confidence?: number } })[];
      }
    ).results?.[0];
    if (!r?.place_id || typeof r.lat !== "number" || typeof r.lon !== "number") return null;
    if ((r.rank?.confidence ?? 1) < 0.3) return null;
    return {
      place_id: r.place_id,
      name: r.name ?? r.address_line1 ?? r.formatted ?? q,
      city: r.city ?? null,
      lat: r.lat,
      lng: r.lon,
      timezone: r.timezone?.name ?? null,
    };
  } catch {
    return null;
  }
}
