/**
 * Firestore data model (see firebase/README.md for the collection layout).
 * Timestamps are Firestore Timestamps in the database and ISO strings in these
 * app-facing types (converted in `lib/firebase/convert.ts`).
 *
 *   users/{uid}                         ProfileDoc
 *   userEmails/{sha256(email)}          UserEmailDoc   (one account per email)
 *   waitlist/{sha256(email)}            WaitlistDoc
 *   inboundCodes/{code}                 { trip_id }    (unique forwarding address)
 *   trips/{tripId}                      TripDoc        (member_ids drives access)
 *   trips/{tripId}/members/{uid}        TripMemberDoc
 *   trips/{tripId}/activity/{id}        ActivityDoc
 *   trips/{tripId}/bookings|expenses|preferences/...   (Phase 2+)
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
  type: BookingType;
  status: BookingStatus;
  start_at: string | null;
  end_at: string | null;
};

export type ExpenseRow = {
  id: string;
  trip_id: string;
  amount_trip_minor: number;
  category: ExpenseCategory;
};
