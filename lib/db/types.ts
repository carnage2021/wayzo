/**
 * App-facing row types. Data lives in Neon Postgres (lib/db/schema.ts) and is mapped to
 * these snake_case shapes in lib/db/rows.ts; timestamps are ISO strings here.
 * Users and sessions live in MongoDB via Better Auth; `*_id` user fields hold its user id.
 */
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export type TripRole = "owner" | "member";
export type BookingType =
  | "flight"
  | "train"
  | "bus"
  | "ferry"
  | "stay"
  | "car_rental"
  | "restaurant"
  | "activity"
  | "event"
  | "other";
export type BookingStatus = "confirmed" | "needs_review" | "discarded";
export type ExpenseCategory = "stay" | "food" | "transport" | "activities" | "shopping" | "other";

/** place_id comes from the places provider (Geoapify) when the city was picked from search. */
export type Destination = { place_id: string | null; name: string; lat: number | null; lng: number | null };

/** Unsplash attribution, required wherever the cover is shown. */
export type CoverCredit = { name: string; url: string };

export type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  home_city: string | null;
  currency: string;
  food_pref: string | null;
  timezone: string | null;
  is_admin: boolean;
  onboarded_at: string | null;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
};

export type UserEmailRow = {
  id: string;
  user_id: string;
  email: string;
  primary: boolean;
  verified_at: string | null;
  created_at: string;
};

export type TripRow = {
  id: string;
  owner_id: string;
  member_ids: string[];
  name: string;
  destinations: Destination[];
  start_date: string | null;
  end_date: string | null;
  currency: string;
  cover_url: string | null;
  cover_credit: CoverCredit | null;
  inbound_code: string;
  status: string;
  planned_budget_minor: number | null;
  created_at: string;
  updated_at: string;
};

export type TripMemberRow = {
  trip_id: string;
  user_id: string;
  role: TripRole;
  email_enabled: boolean;
  push_enabled: boolean;
  joined_at: string;
};

export type ActivityRow = {
  id: string;
  trip_id: string;
  actor_id: string | null;
  verb: string;
  object: JsonValue | null;
  created_at: string;
};

export type BookingRow = {
  id: string;
  trip_id: string;
  added_by: string | null;
  source: "upload" | "email" | "manual";
  /** UploadThing file key of the original ticket. */
  source_key: string | null;
  source_name: string | null;
  source_mime: string | null;
  type: BookingType;
  provider: string | null;
  booking_code: string | null;
  travellers: string[];
  /** Local time as printed, "YYYY-MM-DDTHH:MM" or "YYYY-MM-DD". */
  start_at: string | null;
  end_at: string | null;
  /** UTC instants derived from local time + timezone (for sorting and reminders). */
  start_utc: string | null;
  end_utc: string | null;
  timezone: string | null;
  from_place: string | null;
  to_place: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  seat_or_room: string | null;
  price_minor: number | null;
  currency: string | null;
  contact: string | null;
  notes: string | null;
  confidence: Record<string, number>;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
};

export type ExpenseRow = {
  id: string;
  trip_id: string;
  amount_trip_minor: number;
  category: ExpenseCategory;
};
