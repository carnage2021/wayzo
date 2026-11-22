import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/currencies";
import { EMAIL_RE } from "./email";
import { FOOD_PREFS, TRAVELS_WITH } from "./options";

export { FOOD_PREFS, TRAVELS_WITH, type FoodPref, type TravelsWith } from "./options";

/** Same regex as the design's client-side check, plus a length cap. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "That email is too long.")
  .regex(EMAIL_RE, "Please enter a valid email address.");

export const waitlistSchema = z.object({
  email: emailSchema,
  travels_with: z.enum(TRAVELS_WITH).default("Friends"),
  source: z.string().trim().max(200).optional().nullable(),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "Use a valid date.");

export const currencySchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine((c) => (CURRENCY_CODES as readonly string[]).includes(c), "Pick a supported currency.");

export const destinationSchema = z.object({
  place_id: z.string().max(300).nullable(),
  name: z.string().trim().min(1).max(120),
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
});

export const tripInputSchema = z
  .object({
    name: z.string().trim().min(1, "Give your trip a name.").max(80, "Keep it under 80 characters."),
    destinations: z.array(destinationSchema).max(10, "Up to 10 destinations."),
    start_date: isoDate.nullable(),
    end_date: isoDate.nullable(),
    currency: currencySchema,
  })
  .refine((t) => !(t.start_date && t.end_date) || t.end_date >= t.start_date, {
    path: ["end_date"],
    message: "End date can't be before the start date.",
  })
  .refine((t) => !t.end_date || Boolean(t.start_date), {
    path: ["start_date"],
    message: "Add a start date too.",
  });
export type TripInput = z.infer<typeof tripInputSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(80),
  home_city: z.string().trim().max(120).optional().default(""),
  currency: currencySchema,
  food_pref: z.enum(FOOD_PREFS).optional().nullable(),
  email_notifications: z.boolean().default(true),
  push_notifications: z.boolean().default(false),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Returns the first error message for a field-keyed display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    out[key] ??= issue.message;
  }
  return out;
}
