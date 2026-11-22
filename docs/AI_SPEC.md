# Wayzo MVP 1 — AI Spec

All AI calls go through `lib/ai/` (server only). Provider is swappable (`AI_PROVIDER`). Every output is validated with Zod; invalid output is retried once, then logged to the admin failure queue.

## Jobs

| Job | Model | Input | Output |
| --- | --- | --- | --- |
| `parseTicket` | main (vision) | PDF text and/or page images, email body | `ParsedBooking[]` |
| `planTrip` | main + tools | bookings, merged prefs, places candidates, weather, hours | `TripPlan` |
| `staysReason` / `foodReason` | fast | place facts + group profile | one-line reason per place |
| `assistant` | main + tools | user instruction + trip context | answer and/or `PlanDiff` |
| `storyCaption` | fast | trip summary | 1–2 sentence caption |

## Guardrails (hard rules in code, not just prompt)

1. Places shown must have a `place_id` returned by our Places calls in this request. Drop anything else.
2. Filter `businessStatus !== 'OPERATIONAL'`.
3. Never schedule before arrival / after departure; respect opening hours; keep fixed bookings locked.
4. Prices: only ranges from Places `priceLevel`/`priceRange`; never invent numbers.
5. Assistant changes are proposals (`ai_proposed = true`) until accepted.
6. Per-user daily AI call cap (`AI_DAILY_CALL_CAP_FREE`), tracked in `ai_usage`.
7. Never send other users' emails or personal data to the model beyond first names.

## `parseTicket`

### Output schema (Zod)

```ts
const Confidence = z.number().min(0).max(1);
export const ParsedBooking = z.object({
  type: z.enum(['flight','train','bus','ferry','stay','car_rental','restaurant','activity','event','other']),
  provider: z.string().nullable(),            // airline, hotel name, etc.
  booking_code: z.string().nullable(),        // PNR / confirmation number
  travellers: z.array(z.string()).default([]),
  start_at: z.string().nullable(),            // ISO 8601 local, no offset
  end_at: z.string().nullable(),
  timezone: z.string().nullable(),            // IANA, inferred from place
  from_place: z.string().nullable(),          // e.g. "London Heathrow (LHR)"
  to_place: z.string().nullable(),
  address: z.string().nullable(),
  seat_or_room: z.string().nullable(),
  price: z.number().nullable(),
  currency: z.string().length(3).nullable(),
  contact: z.string().nullable(),
  notes: z.string().nullable(),
  confidence: z.object({
    type: Confidence, start_at: Confidence, end_at: Confidence,
    from_place: Confidence, to_place: Confidence, booking_code: Confidence,
  }),
});
export const ParseResult = z.object({ bookings: z.array(ParsedBooking), is_travel_document: z.boolean() });
```

### Prompt (system)

```
You extract travel bookings from documents. Return ONLY JSON matching the schema.
- A document may contain several bookings (e.g. outbound + return flight): return each.
- Use local times as printed; infer IANA timezone from the airport/station/city.
- For stays: start_at = check-in, end_at = check-out; to_place = property name + city.
- If a field is not present, use null. Never guess booking codes or prices.
- Set confidence per field (0–1). Below 0.6 if you inferred rather than read it.
- If the document is not a travel booking, return {"bookings": [], "is_travel_document": false}.
```

### Post-processing

- Geocode `to_place`/`address` via Places Text Search → `lat`, `lng`, `place_id`.
- Status `confirmed` if min(key confidences) ≥ 0.85, else `needs_review`.
- Dedupe on (`trip_id`, `provider`, `booking_code`).

## `planTrip`

### Tools exposed to the model

- `search_places({ query, near:{lat,lng}, radius_m, type })` → list of `{place_id, name, rating, price_level, types, location, open_hours}`
- `place_details({ place_id })`
- `travel_time({ from_place_id, to_place_id, mode })` → minutes
- `weather({ lat, lng, date })`

### Output schema

```ts
export const PlanItem = z.object({
  day: z.number().int().min(1),
  start_time: z.string(),          // "09:30"
  duration_min: z.number().int(),
  place_id: z.string().nullable(), // null only for fixed bookings or free time
  booking_id: z.string().uuid().nullable(),
  title: z.string(),
  note: z.string().max(140).nullable(),
  category: z.enum(['sight','food','cafe','bar','activity','transit','stay','free']),
});
export const TripPlan = z.object({ items: z.array(PlanItem), summary: z.string().max(280) });
```

### Prompt (system, abbreviated)

```
You plan group trips. Build a realistic day-by-day plan.
Hard rules: use ONLY place_ids returned by tools; keep fixed bookings at their times;
nothing before arrival or after departure; respect opening hours; include travel time;
match pace (relaxed ≈ 3 items/day, balanced ≈ 4–5, packed ≈ 6+), diet, budget and interests;
include breakfast/lunch/dinner suggestions near that day's area; bars only if nightlife ≠ "no".
Return ONLY JSON matching the schema.
```

## `assistant`

Input: the user's instruction + current plan + prefs. Output:

```ts
export const PlanDiff = z.object({
  reply: z.string().max(300),
  add: z.array(PlanItem).default([]),
  remove: z.array(z.string().uuid()).default([]),   // itinerary_item ids
  move: z.array(z.object({ id: z.string().uuid(), day: z.number(), start_time: z.string() })).default([]),
});
```

The UI shows the diff highlighted; Accept applies it in one transaction.

## Evaluation

- Keep a test set of 50+ real tickets (anonymised) in `tests/fixtures/tickets/` with expected JSON.
- `pnpm eval:tickets` reports field accuracy; target ≥ 80% bookings fully correct before beta.
