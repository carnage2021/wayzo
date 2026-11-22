import "server-only";
import { chatJson, modelChain, type ChatMessage, type ContentPart } from "./client";
import { PARSE_RESULT_JSON_SCHEMA, ParseResult } from "./schemas";

/** System prompt from docs/AI_SPEC.md, plus rules learned from real tickets. */
export const PARSE_TICKET_SYSTEM = `You extract travel bookings from documents. Return ONLY JSON matching the schema.
- Return EVERY booking in the document as its own item: each flight/train leg (OUTBOUND and RETURN sections, connections), each stay, each reservation. Two legs on different dates are two bookings.
- type: "stay" for any hotel, hostel, apartment, ryokan, guesthouse or holiday rental (also when several rooms are booked); "activity" for tours, museums and attractions; "event" for concerts, shows and matches; "car_rental" for car hire.
- booking_code: the booking reference / confirmation number / PNR / reservation number / order number, copied exactly.
- Use local times exactly as printed, as "YYYY-MM-DDTHH:MM" (no offset). If only a date is printed, use "YYYY-MM-DD". Numeric dates like 14/08/2027 or 20.05.2027 are day-month-year unless the document clearly uses month-day.
- Infer the IANA timezone of the start place from the airport/station/city (e.g. "Europe/Lisbon").
- If an arrival time is earlier than the departure time and no arrival date is printed, the arrival is on the next day.
- If a year is missing, use the year that puts the date in the future relative to the booking date, or the trip dates given below.
- Flights/trains/buses/ferries: provider = carrier (e.g. "Vietjet"); from_place and to_place = "City or airport/station name (CODE)" when a code is known; seat_or_room = seat if assigned.
- Stays: start_at = check-in, end_at = check-out (add the times only if printed); provider = property name; to_place = property name + city; address = full address if printed.
- Restaurants, activities, events: start_at = reservation/start time; to_place = venue name + city.
- travellers = passenger/guest names exactly as printed.
- price: only if a price is printed for that booking. If one total covers several bookings, put the total on the first booking only, and say "Total for the whole booking" in notes. Never guess booking codes or prices.
- currency: ISO 4217 code (e.g. "USD") if shown.
- If a field is not present, use null.
- Set confidence per field (0-1): 0.9+ when read directly; below 0.6 if inferred.
- If the document is not a travel booking, return {"bookings": [], "is_travel_document": false}.`;

export type TicketContent =
  | { kind: "text"; text: string }
  | { kind: "image"; mime: string; base64: string }
  | { kind: "pdf"; base64: string; filename: string };

export type TripHint = {
  name: string;
  start_date: string | null;
  end_date: string | null;
  destinations: string[];
};

function hintLine(trip: TripHint | null): string {
  if (!trip) return "";
  const dates = trip.start_date
    ? `${trip.start_date} to ${trip.end_date ?? trip.start_date}`
    : "dates not set yet";
  const where = trip.destinations.length ? trip.destinations.join(", ") : "destination not set yet";
  return `\n\nTrip context (for missing years only, never copy into fields): "${trip.name}", ${dates}, ${where}.`;
}

/** Limits document text sent to the model (tickets rarely need more; long T&Cs are noise). */
const MAX_TEXT = 24_000;

export function buildParseMessages(
  content: TicketContent[],
  trip: TripHint | null,
  emailContext?: string,
): ChatMessage[] {
  const parts: ContentPart[] = [
    { type: "text", text: `Extract every booking from this document.${hintLine(trip)}` },
  ];
  if (emailContext) parts.push({ type: "text", text: `Email:\n${emailContext.slice(0, 8000)}` });
  for (const c of content) {
    if (c.kind === "text") parts.push({ type: "text", text: `Document text:\n${c.text.slice(0, MAX_TEXT)}` });
    else if (c.kind === "image")
      parts.push({ type: "image_url", image_url: { url: `data:${c.mime};base64,${c.base64}` } });
    else
      parts.push({
        type: "file",
        file: { filename: c.filename, file_data: `data:application/pdf;base64,${c.base64}` },
      });
  }
  return [
    { role: "system", content: PARSE_TICKET_SYSTEM },
    { role: "user", content: parts },
  ];
}

const TRANSPORT = new Set(["flight", "train", "bus", "ferry"]);
const RETURN_WORDS = /\b(return|inbound|outbound|retour|vuelta|ritorno|rückflug)\b/i;

/** Flight/train numbers like VJ1806, TP 1351, EZY8217, EK 001, 9W123 (2–3 letter/digit carrier + 1–4 digits). */
const SERVICE_NUMBER = /\b(?:[A-Z]{2,3}|[A-Z]\d|\d[A-Z])\s?\d{2,4}\b/g;

/** Distinct service numbers printed in the document (e.g. one per leg). */
export function serviceNumbers(text: string): Set<string> {
  return new Set([...text.matchAll(SERVICE_NUMBER)].map((m) => m[0].replace(/\s+/g, "")));
}

/**
 * Free models sometimes drop a leg. Ask a second model when the document clearly has more
 * journeys than we got back: it names a return/outbound leg, or prints more distinct
 * flight/train numbers than transport bookings were returned.
 */
export function looksIncomplete(content: TicketContent[], result: ParseResult): boolean {
  const text = content.map((c) => (c.kind === "text" ? c.text : "")).join("\n");
  const legs = result.bookings.filter((b) => TRANSPORT.has(b.type)).length;
  if (legs === 0) return false;
  if (legs === 1 && RETURN_WORDS.test(text)) return true;
  const services = serviceNumbers(text).size;
  return services >= 2 && services <= 12 && legs < services;
}

/** Runs parseTicket. Scanned PDFs use OpenRouter's free "cloudflare-ai" parser (never the paid OCR default). */
export async function parseTicket(content: TicketContent[], trip: TripHint | null, emailContext?: string) {
  const hasPdf = content.some((c) => c.kind === "pdf");
  const run = (models?: string[]) =>
    chatJson({
      messages: buildParseMessages(content, trip, emailContext),
      schema: ParseResult,
      jsonSchema: PARSE_RESULT_JSON_SCHEMA,
      schemaName: "parse_result",
      plugins: hasPdf ? [{ id: "file-parser", pdf: { engine: "cloudflare-ai" } }] : undefined,
      timeoutMs: 60_000,
      models,
    });

  const first = await run();
  if (!looksIncomplete(content, first.data)) return { ...first, calls: 1 };
  const others = modelChain().filter((m) => m !== first.model);
  try {
    const second = await run(others);
    const better = second.data.bookings.length > first.data.bookings.length ? second : first;
    return { ...better, calls: 2 };
  } catch {
    return { ...first, calls: 2 };
  }
}
