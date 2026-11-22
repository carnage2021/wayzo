import { z } from "zod";

/** Booking types, as in docs/AI_SPEC.md. */
export const BOOKING_TYPES = [
  "flight",
  "train",
  "bus",
  "ferry",
  "stay",
  "car_rental",
  "restaurant",
  "activity",
  "event",
  "other",
] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

const nullableText = z.union([z.string(), z.null(), z.undefined()]).transform((v) => {
  const t = typeof v === "string" ? v.trim() : "";
  return t && !/^(null|n\/a|none|unknown|-)$/i.test(t) ? t.slice(0, 300) : null;
});

/** "2027-04-12T11:05" (local, no offset). Accepts a date only, seconds, or a trailing offset/Z (dropped). */
const localDateTime = z.union([z.string(), z.null(), z.undefined()]).transform((v) => {
  if (typeof v !== "string") return null;
  const m = v.trim().match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/);
  if (!m) return null;
  if (Number.isNaN(Date.parse(`${m[1]}T00:00:00Z`))) return null;
  return m[2] ? `${m[1]}T${m[2]}` : m[1];
});

const confidence = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((v) => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
});

export const CONFIDENCE_FIELDS = [
  "type",
  "start_at",
  "end_at",
  "from_place",
  "to_place",
  "booking_code",
] as const;
export type ConfidenceField = (typeof CONFIDENCE_FIELDS)[number];

const BOOKING_KEYS = [
  "type",
  "provider",
  "booking_code",
  "travellers",
  "start_at",
  "end_at",
  "timezone",
  "from_place",
  "to_place",
  "address",
  "seat_or_room",
  "price",
  "currency",
  "contact",
  "notes",
  "confidence",
] as const;

/** Models sometimes omit keys: fill every missing key with null so the field rules below decide. */
function fillMissing(v: unknown): unknown {
  if (!v || typeof v !== "object" || Array.isArray(v)) return v;
  const out: Record<string, unknown> = { ...(v as Record<string, unknown>) };
  for (const k of BOOKING_KEYS) if (out[k] === undefined) out[k] = k === "type" ? "other" : null;
  return out;
}

const ParsedBookingShape = z.object({
  type: z
    .string()
    .transform((t) =>
      t
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_"),
    )
    .transform((t) => (t === "hotel" || t === "apartment" ? "stay" : t))
    .pipe(z.enum(BOOKING_TYPES).catch("other")),
  provider: nullableText,
  booking_code: nullableText.transform((v) => (v ? v.replace(/\s+/g, "").toUpperCase().slice(0, 40) : null)),
  travellers: z
    .array(z.string())
    .nullish()
    .transform((a) =>
      (a ?? [])
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20),
    ),
  start_at: localDateTime,
  end_at: localDateTime,
  timezone: nullableText,
  from_place: nullableText,
  to_place: nullableText,
  address: nullableText,
  seat_or_room: nullableText,
  price: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((v) => {
    const n = typeof v === "string" ? Number(v.replace(/[^\d.]/g, "")) : v;
    return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : null;
  }),
  currency: nullableText.transform((c) => (c && /^[a-z]{3}$/i.test(c) ? c.toUpperCase() : null)),
  contact: nullableText,
  notes: nullableText,
  confidence: z
    .record(z.string(), z.unknown())
    .nullish()
    .transform(
      (c) =>
        Object.fromEntries(CONFIDENCE_FIELDS.map((f) => [f, confidence.parse(c?.[f])])) as Record<
          ConfidenceField,
          number
        >,
    ),
});
export const ParsedBooking = z.preprocess(fillMissing, ParsedBookingShape);
export type ParsedBooking = z.infer<typeof ParsedBookingShape>;

export const ParseResult = z.object({
  bookings: z.array(ParsedBooking).max(20),
  is_travel_document: z.boolean(),
});
export type ParseResult = z.infer<typeof ParseResult>;

/** JSON Schema sent as response_format (structured outputs). Mirrors ParsedBooking's input shape. */
const str = { type: ["string", "null"] };
const conf = { type: "number", minimum: 0, maximum: 1 };
export const PARSE_RESULT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["bookings", "is_travel_document"],
  properties: {
    is_travel_document: { type: "boolean" },
    bookings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "type",
          "provider",
          "booking_code",
          "travellers",
          "start_at",
          "end_at",
          "timezone",
          "from_place",
          "to_place",
          "address",
          "seat_or_room",
          "price",
          "currency",
          "contact",
          "notes",
          "confidence",
        ],
        properties: {
          type: { type: "string", enum: [...BOOKING_TYPES] },
          provider: str,
          booking_code: str,
          travellers: { type: "array", items: { type: "string" } },
          start_at: str,
          end_at: str,
          timezone: str,
          from_place: str,
          to_place: str,
          address: str,
          seat_or_room: str,
          price: { type: ["number", "null"] },
          currency: str,
          contact: str,
          notes: str,
          confidence: {
            type: "object",
            additionalProperties: false,
            required: [...CONFIDENCE_FIELDS],
            properties: Object.fromEntries(CONFIDENCE_FIELDS.map((f) => [f, conf])),
          },
        },
      },
    },
  },
} as const;
