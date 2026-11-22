import { z } from "zod";
import { BOOKING_TYPES } from "@/lib/ai/schemas";

/** Edits from the booking review/edit screen. */
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => v || null)
    .nullable();
const localTime = z
  .string()
  .trim()
  .regex(/^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2})?$/, "Use a valid date and time.")
  .nullable()
  .or(z.literal("").transform(() => null));

export const bookingEditSchema = z
  .object({
    type: z.enum(BOOKING_TYPES),
    provider: text(120),
    booking_code: text(40),
    start_at: localTime,
    end_at: localTime,
    from_place: text(200),
    to_place: text(200),
    address: text(300),
    seat_or_room: text(60),
    price: z
      .union([z.number(), z.string()])
      .transform((v) => (v === "" ? null : Number(v)))
      .refine((v) => v === null || (Number.isFinite(v) && v >= 0), "Enter a valid amount.")
      .nullable(),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .refine((c) => c === "" || /^[A-Z]{3}$/.test(c), "Use a 3-letter currency code.")
      .transform((c) => c || null)
      .nullable(),
    notes: text(500),
  })
  .refine((b) => Boolean(b.start_at), { path: ["start_at"], message: "Add a date." })
  .refine((b) => !b.start_at || !b.end_at || b.end_at >= b.start_at, {
    path: ["end_at"],
    message: "End can't be before the start.",
  });
export type BookingEdit = z.input<typeof bookingEditSchema>;
