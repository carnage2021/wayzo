# CLAUDE.md — Wayzo MVP 1

You are building **Wayzo MVP 1**, a web-only AI trip dashboard for group travel. Read every file in `docs/` before writing code. Follow `docs/ROADMAP.md` phase by phase.

## Golden rules

1. **Web only.** No WhatsApp, no native apps, no Gmail/Outlook inbox sync in MVP 1. If a doc mentions them, it's for later.
2. **Follow the roadmap order.** Finish and demo one phase before starting the next. Show a short plan before each phase.
3. **The design is final.** Match `design/landing-page.html` and `docs/DESIGN_SYSTEM.md` exactly (colors, fonts, radii, motion). The app UI uses the same tokens.
4. **The AI never invents places.** Every place shown must come from the places provider (`lib/places/`, Geoapify in MVP 1) with a `place_id`. See `docs/AI_SPEC.md`.
5. **Secrets stay on the server.** AI, Places and email keys are only used in server code (route handlers, server actions). Never in client components.
6. **Security first.** Browsers never touch the databases or file storage directly. Every trip read/write goes through server code that checks membership (`trip_members`) or ownership (`trips.owner_id`); uploads are checked in the UploadThing middleware and recorded in `uploads`. See `docs/BACKEND.md`.
7. **Ask before adding scope.** If something is unclear or missing in the docs, ask; don't guess big features.
8. Keep `docs/ROADMAP.md` checkboxes up to date as you finish tasks.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), TypeScript (strict), React Server Components |
| Styling | Tailwind CSS + CSS variables from `docs/DESIGN_SYSTEM.md`, shadcn/ui (restyled), Framer Motion for app animations |
| Fonts | `Bricolage Grotesque` (display), `Inter` (body) via `next/font/google` |
| Data | Neon Postgres + Drizzle ORM (app data), Better Auth with MongoDB Atlas (logins: email + password, Google), UploadThing (files); Vercel Cron for scheduled jobs |
| Validation | Zod for every API input and every AI output |
| Data fetching | Server components + server actions; TanStack Query only where live client state is needed |
| AI | Any OpenAI-compatible API via server-only wrapper `lib/ai/` (OpenRouter free models in development; Claude/Gemini/paid models by env) |
| Places/Maps | Geoapify (city search, places, routing; free tier), Unsplash for cover photos; map tiles TBD in Phase 3 |
| Email | Resend (send), Postmark or Resend Inbound (receive) |
| Push | Web Push (VAPID) with a service worker |
| PWA | `manifest.webmanifest` + service worker (next-pwa or custom) |
| Monitoring | Sentry, PostHog |
| Tests | Vitest (unit), Playwright (key flows) |

## Folder structure (target)

```
app/
  (marketing)/page.tsx          # landing page (port of design/landing-page.html)
  (marketing)/privacy, terms
  (auth)/login, auth/callback
  (app)/trips/page.tsx          # My trips
  (app)/trips/new
  (app)/trips/[tripId]/         # dashboard, bookings, plan, stays, food, expenses, album, members, settings
  s/[shareId]/page.tsx          # public trip story
  admin/                        # admin panel (role-gated)
  api/                          # route handlers (waitlist, uploads, inbound-email webhook, push, cron)
components/ (ui/, marketing/, trip/, itinerary/, expenses/ ...)
lib/
  db/ (index.ts, schema.ts, rows.ts, types.ts)
  auth/ (index.ts, server.ts, client.ts, profile.ts)
  ai/ (client.ts, parse-ticket.ts, plan-trip.ts, assistant.ts, schemas.ts)
  places/ (search.ts, details.ts, cache.ts)
  notifications/ (email.ts, push.ts, brief.ts)
  money/ (fx.ts, balances.ts)
drizzle/ (SQL migrations)
docs/  design/
```

## Conventions

- TypeScript strict, no `any`. Zod schema next to every server action / route.
- Server actions for mutations; return typed results `{ ok: true, data } | { ok: false, error }`.
- Money stored as integer minor units (`amount_minor`) + ISO currency code.
- Times stored as `timestamptz` (UTC) plus the local time as printed and the IANA timezone of the place.
- All lists empty-state designed; all async UI has loading + error states.
- Accessible: real buttons/links/labels, focus rings, contrast ≥ 4.5:1, `prefers-reduced-motion` respected.
- Mobile first: every app screen must work at 375px wide.
- Commit per task with clear messages.

## Definition of done (every feature)

- Matches acceptance criteria in `docs/FEATURES.md`
- Works on mobile and desktop, light theme (dark theme not required in MVP 1)
- Access verified (a non-member cannot read/write: server membership check)
- Loading, empty and error states exist
- Unit tests for logic (parsing, balances, scheduling); Playwright for the main flow
