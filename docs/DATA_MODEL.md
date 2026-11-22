# Wayzo MVP 1 — Data Model

Storage: **Neon Postgres** (app data, `lib/db/schema.ts`) and **MongoDB** (logins, via Better Auth). The tables below describe all entities; the ones built so far, and how access is enforced, are in `docs/BACKEND.md`.

## Entities

```
users ─┬─< user_emails
       ├─< trip_members >─ trips ─┬─< bookings
       │                          ├─< preferences (per user)
       │                          ├─< itinerary_items >─ places
       │                          ├─< stay_options >─ places
       │                          ├─< stay_votes
       │                          ├─< expenses ─< expense_splits
       │                          ├─< settlements
       │                          ├─< media
       │                          ├─< notifications
       │                          ├─< invites
       │                          └── stories
waitlist · places · inbound_emails · ai_usage · push_subscriptions · fx_rates · activity
```

## Tables

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | App user profile (1:1 with `auth.users`) | id, name, avatar_url, home_city, currency, food_pref, timezone, is_admin |
| `user_emails` | Extra verified emails for inbound matching | user_id, email, verified_at |
| `waitlist` | Landing page sign-ups | email (unique), travels_with, source, invited_at |
| `trips` | A trip | owner_id, name, destinations jsonb, start_date, end_date, currency, cover_url, inbound_code (unique), status |
| `trip_members` | Membership + role | trip_id, user_id, role (owner/member), joined_at |
| `invites` | Email/link invites | trip_id, email, token, expires_at, accepted_by, revoked_at |
| `preferences` | Quiz answers per member | trip_id, user_id, stay_budget_minor, food_budget_minor, stay_types[], diets[], nightlife, pace, interests[] |
| `bookings` | Parsed tickets | trip_id, added_by, type, provider, booking_code, start_at, end_at, timezone, from_place, to_place, address, lat, lng, place_id, price_minor, currency, source_path, confidence jsonb, status |
| `places` | Cached places (provider: Geoapify) | place_id (pk), name, lat, lng, rating, user_ratings, price_level, types[], hours jsonb, photo_ref, business_status, cached_at |
| `itinerary_items` | Plan items | trip_id, day, sort_order, start_time, duration_min, place_id, booking_id, title, note, category, ai_proposed, added_by, updated_by |
| `stay_options` | Suggested stays per gap | trip_id, place_id, nights daterange, affiliate_url, ai_reason, score |
| `stay_votes` | Votes | stay_option_id, user_id |
| `expenses` | Expenses | trip_id, paid_by, amount_minor, currency, fx_rate, amount_trip_minor, category, note, receipt_path, spent_on |
| `expense_splits` | Shares | expense_id, user_id, share_minor |
| `settlements` | Settled payments | trip_id, from_user, to_user, amount_minor, settled_at |
| `media` | Album photos | trip_id, user_id, path, taken_at, in_story |
| `stories` | Shareable recap | trip_id, share_id (unique), published, show_spend, photo_ids[] |
| `notifications` | Scheduled + sent alerts | trip_id, user_id, kind, channel, fire_at, sent_at, payload jsonb |
| `push_subscriptions` | Web push endpoints | user_id, endpoint, p256dh, auth |
| `inbound_emails` | Raw inbound log | trip_id, from_email, subject, raw_path, result jsonb, status |
| `ai_usage` | Cost tracking & caps | user_id, day, calls, input_tokens, output_tokens, cost_usd |
| `fx_rates` | Daily FX | day, base, rates jsonb |
| `activity` | Trip activity feed | trip_id, actor_id, verb, object jsonb, created_at |
| `affiliate_clicks` | Click log | trip_id, user_id, place_id, partner, created_at |

## Access summary (enforced by membership checks in server code; see `docs/BACKEND.md`)

- Helper `is_trip_member(trip_id)` returns true if `auth.uid()` is in `trip_members` for that trip.
- Trip-scoped tables: select/insert/update/delete only when `is_trip_member(trip_id)`; delete on `trips`, `trip_members` (others), `invites` only for owner.
- `profiles`: users read profiles of people they share a trip with; update only self.
- `waitlist`, `inbound_emails`, `ai_usage`, `fx_rates`, `affiliate_clicks`: service role only (no public policies).
- `stories`: public read when `published = true` via a security-definer function exposing only safe fields.
