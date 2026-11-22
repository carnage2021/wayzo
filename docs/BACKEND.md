# Backend: where data lives and how it's protected

All three services run on free plans that don't need a credit card.

| What | Service | Code |
| --- | --- | --- |
| Logins: users, sessions, linked Google accounts | **Better Auth**, stored in **MongoDB Atlas** | `lib/auth/server.ts`, `app/api/auth/[...all]` |
| App data: profiles, trips, members, activity, bookings, uploads, AI usage, waitlist | **Neon Postgres** with **Drizzle ORM** | `lib/db/schema.ts`, migrations in `drizzle/` |
| Files (tickets, later photos) | **UploadThing** | `app/api/uploadthing/core.ts` |

Better Auth user ids (from MongoDB) are stored as `text` in every Neon `user_id` / `owner_id` column.

## Sign-in

- **Email + password.** Passwords are hashed by Better Auth. "Forgot password" sends a reset link through Resend; in development the link is logged to the console instead.
- **Continue with Google** appears automatically once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. The redirect URI is `<site>/api/auth/callback/google`.
- **Sessions** are httpOnly cookies prefixed `wayzo.` and last 14 days. A signed cookie cache saves database lookups for 5 minutes.
- **Request origins:** auth requests must come from `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` or `BETTER_AUTH_TRUSTED_ORIGINS`. In development, any localhost port is allowed.
- **Route guard:** `middleware.ts` sends app routes without a session cookie to `/login`. Every page and action still verifies the session with `getUser()` / `requireUser()` (`lib/auth/index.ts`).
- **Profiles:** a new user gets a profile row in Neon `profiles`, via the database hook in `lib/auth/server.ts`. `getProfile()` also creates it if it's missing.

## Access control (replaces Supabase RLS)

Browsers never talk to the databases or the file storage with their own credentials. All reads and writes go through server code, and each check happens in that code:

- **Trip data:** `getTrip()` (`lib/trips/queries.ts`) and `memberAccess()` (`lib/trips/access.ts`) join `trip_members` on the signed-in user. Non-members get the same 404 as a missing trip.
- **Owner-only actions** (edit trip, delete trip, extend dates) also check `trips.owner_id`.
- **Uploads:**
  - The UploadThing route middleware rejects anyone who isn't a member of the trip.
  - The completion callback records the file in `uploads` (key, trip, uploader).
  - The ticket reader only processes uploads made by the same user to the same trip.
- **Original files** open through `/api/trips/:id/bookings/:bookingId/source`, which checks membership first.
  - The stored file URLs are long random links. UploadThing's free plan serves files publicly by link, so the URL is never put on a page.
- **Deletions:**
  - Deleting a trip removes its files from UploadThing, then everything trip-scoped (`ON DELETE CASCADE`).
  - Deleting an account hands owned trips to the longest-standing member (or deletes them), removes the user's Neon rows, then deletes the login (sessions, accounts, user) in MongoDB.

## Tables (Neon)

| Table | Holds |
| --- | --- |
| `profiles` | id (Better Auth user id), email, name, avatar_url, home_city, currency, food_pref, timezone, is_admin, onboarded_at, notification switches |
| `user_emails` | user_id, email (**unique**: one account per address), primary, verified_at |
| `waitlist` | email (unique), travels_with, source, invited_at |
| `trips` | owner_id, name, destinations (jsonb), start_date, end_date, currency, cover_url, cover_credit, inbound_code (unique), status, planned_budget_minor |
| `trip_members` | (trip_id, user_id), role, email/push switches, joined_at |
| `activity` | trip_id, actor_id, verb, object, created_at |
| `uploads` | key (UploadThing), trip_id, user_id, url, name, mime, size |
| `bookings` | trip_id, added_by, source + source_key, type, provider, booking_code, travellers, start_at/end_at (local), start_utc/end_utc, timezone, places, lat/lng/place_id, price_minor + currency, confidence, status, dedupe_key |
| `ai_usage` | (user_id, day), calls, jobs, tokens: the daily AI cap |

Conventions:
- **Money** is stored as integer minor units plus an ISO currency code.
- **Calendar dates** are `date` columns.
- **Instants** are `timestamptz`.
- **Booking times** are kept twice: local as printed, plus UTC.

## Changing the schema

```bash
# 1. edit lib/db/schema.ts
pnpm db:generate     # writes a new SQL migration to drizzle/
pnpm db:migrate      # applies pending migrations to DATABASE_URL
pnpm db:studio       # optional: browse the data
```

Commit the generated `drizzle/` files with the schema change.
