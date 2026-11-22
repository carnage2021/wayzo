# Firebase: data layout and security

Wayzo uses **Firebase Auth** (email link + Google), **Cloud Firestore** (data) and **Cloud Storage** (files).

## How access works

1. The browser signs in with Firebase Auth, then sends the ID token to `POST /api/auth/session`.
2. The server checks the token and sets an httpOnly `__session` cookie (14 days). The browser keeps no Firebase login of its own.
3. Every page and server action reads the cookie through `getUser()` in `lib/auth.ts`, then uses the **Admin SDK** to read and write data.
4. The Admin SDK skips security rules, so **the server checks trip membership itself**. `getTrip()` returns `null` (shown as a 404) unless the user's id is in `trip.member_ids`, and owner-only actions check `owner_id`.
5. `firestore.rules` and `storage.rules` are a second layer of protection:
   - Browsers can never write.
   - Only trip members can read their trip. This keeps realtime listeners safe when later phases add them.

This replaces the Supabase rule "RLS on every trip table".

## Collections

| Path | Holds | Notes |
| --- | --- | --- |
| `users/{uid}` | profile: name, avatar_url, email, home_city, currency, food_pref, timezone, onboarded_at, email/push_notifications, is_admin | created on first sign-in |
| `userEmails/{sha256(email)}` | user_id, email, primary, verified_at | Using the email hash as the document id means one address belongs to one account. Extra emails are verified with a signed link (24h). |
| `waitlist/{sha256(email)}` | email, travels_with, source, invited_at | Duplicate sign-ups are ignored and get no second email. |
| `inboundCodes/{code}` | trip_id | Makes each trip's forwarding address `trip-<code>@…` unique. Phase 2 uses it to route inbound email. |
| `trips/{tripId}` | owner_id, **member_ids[]**, name, destinations[], start_date, end_date, currency, cover_url, cover_credit, inbound_code, status, planned_budget_minor | `member_ids` drives every access check |
| `trips/{tripId}/members/{uid}` | role (`owner`/`member`), email_enabled, push_enabled, joined_at | |
| `trips/{tripId}/activity/{id}` | actor_id, verb, object, created_at | activity feed |
| `trips/{tripId}/bookings`, `expenses`, `preferences/{uid}`, … | Phase 2+ | Deleted together with the trip (`recursiveDelete`) |

Conventions:
- **Money** is stored as integer minor units (`amount_minor`) plus an ISO currency code.
- **Calendar dates** are `YYYY-MM-DD` strings.
- **Timestamps** are Firestore Timestamps.

## Storage

Files go under `trips/{tripId}/{tickets|photos|covers}/{file}`:
- Only members can read them.
- Members can upload images or PDFs up to 20 MB.
- Only the server can replace or delete files.

## Indexes

Phase 1 needs no composite indexes, because sorting happens in code. When a later query needs one, add it to `firestore.indexes.json` and deploy:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```
