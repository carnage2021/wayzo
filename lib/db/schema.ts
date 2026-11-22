import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { CoverCredit, Destination, JsonValue } from "./types";

/**
 * Wayzo data in Neon Postgres (see docs/DATA_MODEL.md).
 * Users and sessions live in MongoDB (Better Auth); `user_id` columns hold the Better Auth user id.
 * Every trip read/write is checked against trip_members in server code.
 */
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const created = () => ts("created_at").notNull().defaultNow();

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  homeCity: text("home_city"),
  currency: text("currency").notNull().default("USD"),
  foodPref: text("food_pref"),
  timezone: text("timezone"),
  isAdmin: boolean("is_admin").notNull().default(false),
  onboardedAt: ts("onboarded_at"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(false),
  createdAt: created(),
});

/** Extra emails for inbound matching. The unique email means one address belongs to one account. */
export const userEmails = pgTable(
  "user_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    email: text("email").notNull(),
    primary: boolean("primary").notNull().default(false),
    verifiedAt: ts("verified_at"),
    createdAt: created(),
  },
  (t) => [uniqueIndex("user_emails_email_key").on(t.email), index("user_emails_user_idx").on(t.userId)],
);

export const waitlist = pgTable(
  "waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    travelsWith: text("travels_with"),
    source: text("source"),
    invitedAt: ts("invited_at"),
    createdAt: created(),
  },
  (t) => [uniqueIndex("waitlist_email_key").on(t.email)],
);

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    destinations: jsonb("destinations")
      .$type<Destination[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    currency: text("currency").notNull().default("USD"),
    coverUrl: text("cover_url"),
    coverCredit: jsonb("cover_credit").$type<CoverCredit | null>(),
    inboundCode: text("inbound_code").notNull(),
    status: text("status").notNull().default("planning"),
    plannedBudgetMinor: integer("planned_budget_minor"),
    createdAt: created(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("trips_inbound_code_key").on(t.inboundCode), index("trips_owner_idx").on(t.ownerId)],
);

export const tripMembers = pgTable(
  "trip_members",
  {
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").$type<"owner" | "member">().notNull().default("member"),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    pushEnabled: boolean("push_enabled").notNull().default(true),
    joinedAt: ts("joined_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.tripId, t.userId] }), index("trip_members_user_idx").on(t.userId)],
);

export const activity = pgTable(
  "activity",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    actorId: text("actor_id"),
    verb: text("verb").notNull(),
    object: jsonb("object").$type<JsonValue>(),
    createdAt: created(),
  },
  (t) => [index("activity_trip_idx").on(t.tripId, t.createdAt)],
);

/** Files uploaded through UploadThing; lets the server confirm who uploaded what to which trip. */
export const uploads = pgTable(
  "uploads",
  {
    key: text("key").primaryKey(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    kind: text("kind").notNull().default("ticket"),
    url: text("url").notNull(),
    name: text("name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    createdAt: created(),
  },
  (t) => [index("uploads_trip_idx").on(t.tripId)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    addedBy: text("added_by"),
    source: text("source").$type<"upload" | "email" | "manual">().notNull().default("upload"),
    sourceKey: text("source_key"),
    sourceName: text("source_name"),
    sourceMime: text("source_mime"),
    type: text("type").notNull(),
    provider: text("provider"),
    bookingCode: text("booking_code"),
    travellers: jsonb("travellers")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    startAt: text("start_at"),
    endAt: text("end_at"),
    startUtc: ts("start_utc"),
    endUtc: ts("end_utc"),
    timezone: text("timezone"),
    fromPlace: text("from_place"),
    toPlace: text("to_place"),
    address: text("address"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    placeId: text("place_id"),
    seatOrRoom: text("seat_or_room"),
    priceMinor: integer("price_minor"),
    currency: text("currency"),
    contact: text("contact"),
    notes: text("notes"),
    confidence: jsonb("confidence")
      .$type<Record<string, number>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    status: text("status")
      .$type<"confirmed" | "needs_review" | "discarded">()
      .notNull()
      .default("needs_review"),
    dedupeKey: text("dedupe_key"),
    confirmedBy: text("confirmed_by"),
    createdAt: created(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("bookings_trip_idx").on(t.tripId, t.status),
    index("bookings_dedupe_idx").on(t.tripId, t.dedupeKey),
  ],
);

/** Per-user daily AI calls (docs/AI_SPEC.md guardrail 6). */
export const aiUsage = pgTable(
  "ai_usage",
  {
    userId: text("user_id").notNull(),
    day: date("day", { mode: "string" }).notNull(),
    calls: integer("calls").notNull().default(0),
    jobs: jsonb("jobs")
      .$type<Record<string, number>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    lastModel: text("last_model"),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);
