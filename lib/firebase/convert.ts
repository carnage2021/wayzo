import "server-only";
import { createHash } from "node:crypto";
import { Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import type { ActivityRow, ProfileRow, TripMemberRow, TripRow, UserEmailRow } from "./types";

/** Firestore Timestamp / Date / string -> ISO string (or null). */
export function toIso(v: unknown): string | null {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return null;
}

/** Stable document id for an email address (emails can contain `/`, which ids can't). */
export function emailKey(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

type Data = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : null);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const num = (v: unknown) => (typeof v === "number" ? v : null);

export function toProfile(snap: DocumentSnapshot): ProfileRow | null {
  if (!snap.exists) return null;
  const d = snap.data() as Data;
  return {
    id: snap.id,
    email: str(d.email),
    name: str(d.name),
    avatar_url: str(d.avatar_url),
    home_city: str(d.home_city),
    currency: str(d.currency) ?? "USD",
    food_pref: str(d.food_pref),
    timezone: str(d.timezone),
    is_admin: bool(d.is_admin, false),
    onboarded_at: toIso(d.onboarded_at),
    email_notifications: bool(d.email_notifications, true),
    push_notifications: bool(d.push_notifications, false),
    created_at: toIso(d.created_at) ?? new Date(0).toISOString(),
  };
}

export function toUserEmail(snap: DocumentSnapshot): UserEmailRow | null {
  if (!snap.exists) return null;
  const d = snap.data() as Data;
  return {
    id: snap.id,
    user_id: str(d.user_id) ?? "",
    email: str(d.email) ?? "",
    primary: bool(d.primary, false),
    verified_at: toIso(d.verified_at),
    created_at: toIso(d.created_at) ?? new Date(0).toISOString(),
  };
}

export function toTrip(snap: DocumentSnapshot): TripRow | null {
  if (!snap.exists) return null;
  const d = snap.data() as Data;
  return {
    id: snap.id,
    owner_id: str(d.owner_id) ?? "",
    member_ids: Array.isArray(d.member_ids) ? (d.member_ids as string[]) : [],
    name: str(d.name) ?? "Untitled trip",
    destinations: Array.isArray(d.destinations) ? (d.destinations as TripRow["destinations"]) : [],
    start_date: str(d.start_date),
    end_date: str(d.end_date),
    currency: str(d.currency) ?? "USD",
    cover_url: str(d.cover_url),
    cover_credit: (d.cover_credit as TripRow["cover_credit"]) ?? null,
    inbound_code: str(d.inbound_code) ?? "",
    status: str(d.status) ?? "planning",
    planned_budget_minor: num(d.planned_budget_minor),
    created_at: toIso(d.created_at) ?? new Date(0).toISOString(),
    updated_at: toIso(d.updated_at) ?? new Date(0).toISOString(),
  };
}

export function toMember(snap: DocumentSnapshot, tripId: string): TripMemberRow {
  const d = (snap.data() ?? {}) as Data;
  return {
    trip_id: tripId,
    user_id: snap.id,
    role: d.role === "owner" ? "owner" : "member",
    email_enabled: bool(d.email_enabled, true),
    push_enabled: bool(d.push_enabled, true),
    joined_at: toIso(d.joined_at) ?? new Date(0).toISOString(),
  };
}

export function toActivity(snap: DocumentSnapshot, tripId: string): ActivityRow {
  const d = (snap.data() ?? {}) as Data;
  return {
    id: snap.id,
    trip_id: tripId,
    actor_id: str(d.actor_id),
    verb: str(d.verb) ?? "",
    object: (d.object as ActivityRow["object"]) ?? null,
    created_at: toIso(d.created_at) ?? new Date(0).toISOString(),
  };
}
