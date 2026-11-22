/**
 * Ticket-reading accuracy check (docs/AI_SPEC.md "Evaluation").
 * Runs every tests/fixtures/tickets/*.txt through parseTicket and compares with *.expected.json.
 *
 *   pnpm eval:tickets                 # all fixtures
 *   pnpm eval:tickets -- 01 17        # only fixtures whose name contains "01" or "17"
 *
 * Each fixture is one AI call (the free tier allows 50/day). Target: >= 80% bookings fully correct.
 */
import fs from "node:fs";
import path from "node:path";
import { parseTicket, type TripHint } from "@/lib/ai/parse-ticket";
import type { ParsedBooking } from "@/lib/ai/schemas";

type Expected = {
  is_travel_document: boolean;
  trip: TripHint | null;
  bookings: Partial<Record<keyof ParsedBooking, string | number>>[];
};

const DIR = path.join(process.cwd(), "tests", "fixtures", "tickets");
const filters = process.argv.slice(2).filter((a) => a !== "--");
const names = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".txt"))
  .map((f) => f.replace(/\.txt$/, ""))
  .filter((n) => !filters.length || filters.some((f) => n.includes(f)))
  .sort();

const norm = (v: unknown) => String(v ?? "").toLowerCase();
const code = (v: unknown) => norm(v).replace(/[^a-z0-9]/g, "");

/** Does one parsed field match the expectation? Places/providers match by "contains". */
function fieldOk(field: string, want: string | number, got: unknown): boolean {
  if (field === "booking_code") return code(got) === code(want);
  // A date-only expectation also accepts a printed time on the same day.
  if ((field === "start_at" || field === "end_at") && /^\d{4}-\d{2}-\d{2}$/.test(String(want)))
    return norm(got).slice(0, 10) === norm(want);
  if (field === "price") return typeof got === "number" && Math.abs(got - Number(want)) < 0.01;
  if (["provider", "from_place", "to_place", "address", "seat_or_room"].includes(field)) return norm(got).includes(norm(want));
  return norm(got) === norm(want);
}

async function main() {
  let bookingsTotal = 0;
  let bookingsCorrect = 0;
  let fieldsTotal = 0;
  let fieldsCorrect = 0;
  const failures: string[] = [];

  for (const name of names) {
    const text = fs.readFileSync(path.join(DIR, `${name}.txt`), "utf8");
    const exp = JSON.parse(fs.readFileSync(path.join(DIR, `${name}.expected.json`), "utf8")) as Expected;
    const t = Date.now();
    let line = "";
    try {
      const { data, model } = await parseTicket([{ kind: "text", text }], exp.trip);
      const secs = ((Date.now() - t) / 1000).toFixed(1);
      if (data.is_travel_document !== exp.is_travel_document) failures.push(`${name}: is_travel_document=${data.is_travel_document}`);
      // Match expected bookings to parsed ones by start date/time (order independent).
      const used = new Set<number>();
      let ok = 0;
      for (const want of exp.bookings) {
        bookingsTotal++;
        const idx = data.bookings.findIndex((b, i) => !used.has(i) && b.start_at?.slice(0, 10) === String(want.start_at).slice(0, 10));
        const got = idx >= 0 ? data.bookings[idx] : undefined;
        if (idx >= 0) used.add(idx);
        let all = true;
        for (const [field, value] of Object.entries(want)) {
          fieldsTotal++;
          const pass = got ? fieldOk(field, value as string | number, got[field as keyof ParsedBooking]) : false;
          if (pass) fieldsCorrect++;
          else {
            all = false;
            failures.push(`${name}: ${field} expected "${value}" got "${got ? String(got[field as keyof ParsedBooking]) : "(missing booking)"}"`);
          }
        }
        if (all) {
          ok++;
          bookingsCorrect++;
        }
      }
      const extra = data.bookings.length - used.size;
      if (process.env.EVAL_DEBUG) console.log(JSON.stringify(data.bookings, null, 1));
      if (extra > 0) failures.push(`${name}: ${extra} extra booking(s)`);
      line = `${ok === exp.bookings.length && extra === 0 && data.is_travel_document === exp.is_travel_document ? "PASS" : "FAIL"}  ${name}  ${ok}/${exp.bookings.length}  ${secs}s  ${model}`;
    } catch (e) {
      bookingsTotal += exp.bookings.length;
      failures.push(`${name}: error ${e instanceof Error ? e.message.slice(0, 200) : e}`);
      line = `ERR   ${name}`;
    }
    console.log(line);
  }

  const pct = (a: number, b: number) => (b ? ((100 * a) / b).toFixed(1) : "100.0");
  console.log("\nFailures:\n" + (failures.length ? failures.map((f) => "  - " + f).join("\n") : "  none"));
  console.log(`\nBookings fully correct: ${bookingsCorrect}/${bookingsTotal} (${pct(bookingsCorrect, bookingsTotal)}%)  target >= 80%`);
  console.log(`Field accuracy: ${fieldsCorrect}/${fieldsTotal} (${pct(fieldsCorrect, fieldsTotal)}%)`);
}

main();
