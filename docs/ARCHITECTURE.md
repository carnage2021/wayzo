# Wayzo MVP 1 — Architecture

## Overview

```
 Browser (Web app / PWA)            Forwarded booking emails
          │                                   │ (Postmark / Resend Inbound)
          ▼                                   ▼
 ┌───────────────────────── Next.js on Vercel ─────────────────────────┐
 │  App pages + server actions        Ticket intake pipeline            │
 │  (dashboard, auth, planning)       (/api/inbound-email, /api/uploads)│
 └─────┬──────────────┬──────────────────┬──────────────────┬──────────┘
       ▼              ▼                  ▼                  ▼
   AI model     Places + weather      Neon + MongoDB   Email + web push
 (read, plan,   (stays, food,      (data, logins;     (briefs, reminders,
  assist)        hours, travel)     Storage; Vercel    invites)
                                    Cron)
```

The browser never calls the AI, Places (server key) or email APIs directly.

## Key flows

### Ticket upload
1. Client uploads the file to UploadThing (route `ticket`; middleware checks trip membership, the completion callback records it in `uploads`).
2. Client calls `POST /api/trips/:tripId/tickets/process { key }`.
3. Server: extract PDF text (`pdf-parse`) → if empty/scanned, render page images → AI `parseTicket` (vision) → Zod validate → match trip/day → dedupe → insert `bookings` → schedule `notifications` → recompute stay gaps.
4. Members see the new booking on their next load (live updates come with the realtime phase).

### Inbound email
1. `POST /api/inbound-email` (verify signature with `INBOUND_WEBHOOK_SECRET`).
2. Look up trip by recipient `trip-<code>@…`; check sender ∈ members' verified emails.
3. Store raw in `inbound_emails`; attachments → Storage; body + attachments → same pipeline.

### Plan generation
1. `generatePlan({ tripId })` server action → loads bookings, merged prefs, destinations.
2. Places searches (cached in `places`), opening hours, travel times.
3. AI `planTrip` with tools → returns plan JSON → validate every `place_id` exists in fetched set → write `itinerary_items` (ai_proposed=false on first generation).

### Notifications
- Inserting/updating bookings or plan items (re)writes `notifications` rows.
- Vercel Cron → `GET /api/cron/notifications` every 5 min (auth `CRON_SECRET`) → sends due rows (Resend / web-push) → sets `sent_at`.
- Daily brief rows are created per member per trip day at 07:00 local.

## API routes (route handlers)

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/waitlist` | POST | Join waitlist |
| `/api/uploads/sign` | POST | Signed upload URL for tickets/photos |
| `/api/inbound-email` | POST | Inbound email webhook |
| `/api/push/subscribe` | POST/DELETE | Save/remove push subscription |
| `/api/cron/notifications` | GET | Send due notifications |
| `/api/cron/fx` | GET | Daily FX rates refresh |
| `/api/affiliate/click` | GET | Log click, redirect to partner |
| `/api/og/story/[shareId]` | GET | OG image for public story |

Everything else is server actions in `app/(app)/trips/[tripId]/actions.ts` (grouped per module).

## Server actions (main)

`createTrip`, `updateTrip`, `deleteTrip`, `createInvite`, `acceptInvite`, `removeMember`, `processTicket`, `confirmBooking`, `discardBooking`, `updateBooking`, `submitPreferences`, `generatePlan`, `moveItineraryItem`, `addItineraryItem`, `askAssistant`, `acceptProposal`, `getStaySuggestions`, `voteStay`, `getFoodPicks`, `addExpense`, `updateExpense`, `settleBalance`, `uploadPhoto`, `createStory`, `publishStory`.

## Caching

- `places` table: details cached 30 days, search results cached 7 days per (query, location, radius).
- Distance Matrix pairs cached 30 days.
- Plans cached; regenerated only on user action.
- FX rates cached daily.

## Security

- Every trip read/write checks the user is in `trip_members` (server code); browsers have no direct database or storage access. See `docs/BACKEND.md`.
- Storage buckets `tickets`, `photos` private; signed URLs (1h).
- Database and storage credentials are used only in server code (route handlers, server actions, cron).
- Rate limits: waitlist, uploads, AI actions (per-user daily cap in `ai_usage`).
- Input validation with Zod everywhere; AI output validated before use.
