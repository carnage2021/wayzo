# Wayzo MVP 1 — Build Roadmap (12 weeks)

Work phase by phase. Each phase ends with a demo. Tick boxes as tasks finish. Feature IDs (F1…F12) refer to `docs/FEATURES.md`.

---

## Phase 1 — Foundation (Weeks 1–2)

- [x] Init Next.js 15 + TypeScript strict + Tailwind + shadcn/ui; ESLint/Prettier; pnpm
- [x] Design tokens from `DESIGN_SYSTEM.md` as CSS variables + Tailwind theme; fonts via `next/font`
- [x] Base UI kit: Button (lime/ink/ghost), Input, Chip, Card, Avatar stack, Toast, Dialog, Sheet, Tabs, Skeleton, EmptyState
- [x] Backend: Neon Postgres (Drizzle migrations), Better Auth on MongoDB (email + password; Google when keys are added), UploadThing for files. _Moved off Firebase; verified end-to-end (sign up, trip, upload, bookings, delete account)_
- [x] Data layer (`lib/db`), auth (`lib/auth`), session-cookie middleware guard
- [x] **F1** Port `design/landing-page.html` to `app/(marketing)/page.tsx` as components (keep all animations; scroll logic in a small client hook)
- [x] **F1** `/api/waitlist` + confirmation email (Resend); SEO metadata, OG image, robots, sitemap; Privacy/Terms
- [x] **F2** Auth: email + password (+ Google when configured), forgot/reset password; `/login`; onboarding; account page
- [x] PWA: manifest, icons from logo mark, service worker skeleton, splash per `design/splash-screen.html`
- [x] **F3** Create trip, My trips, empty trip dashboard shell with sidebar/bottom nav
- [ ] Sentry + PostHog wired; Vercel preview deploys — _SDKs wired behind env vars; Vercel project needs your account_
- **Demo:** landing live with waitlist; sign in; create a trip.

## Phase 2 — Ticket intake (Weeks 3–4)

- [x] `lib/ai/` provider wrapper + usage tracking (`ai_usage`) + daily cap — _OpenAI-compatible; OpenRouter free models with fallback chain_
- [x] `parseTicket` per `AI_SPEC.md` with Zod; PDF text extraction; image path for scans — _scanned PDFs via OpenRouter's free parser; second opinion when a return leg looks missing_
- [x] Ticket fixtures set (≥ 20 to start) + `pnpm eval:tickets` — _20 fixtures (1 anonymised real itinerary). First full run: 15/20 bookings, 85% of fields; all five failing cases pass after prompt + safeguard fixes (full re-run still to do)_
- [x] **F4** Upload UI: dropzone, multi-file progress, mobile camera — _HEIC converted in the browser; UploadThing; verified end-to-end_
- [x] **F4** `processTicket` pipeline: parse → geocode (Places) → match day → dedupe → save → status — _reminders/stay-gap hooks come with F10/F6_
- [x] **F4** Review screen (source preview + editable fields), undo toast, extend-trip prompt
- [ ] **F4** Inbound email: per-trip address, webhook, sender check, auto-reply, raw log — _needs a domain + Resend Inbound_
- [x] **F4** Bookings timeline page
- [x] Trip auto-fill (dates/destination from first tickets)
- **Demo:** upload or forward 5 different real tickets → correct timeline.

## Phase 3 — AI planning (Weeks 5–6)

- [ ] `lib/places/` search/details/photos with caching + field masks
- [ ] **F5** Preference quiz + `lib/prefs/merge.ts` (unit tested) + group summary
- [ ] Stay-gap calculation
- [ ] **F6** Stay suggestions, cards, filters, affiliate redirect + click log
- [ ] **F7** Food & places per day + must-see list
- [ ] **F8** `planTrip` with tools → itinerary items; day tabs; drag & drop (dnd-kit); add place; map view; travel times
- [ ] **F8** Ask-AI bar → `PlanDiff` proposal UI (accept/reject)
- **Demo:** 3-city trip with bookings → full editable plan in < 60s.

## Phase 4 — Group & money (Weeks 7–8)

- [ ] **F3** Invites (email + link), join flow, roles, remove member, pending list
- [ ] Realtime (e.g. Pusher/Ably free tier) for bookings, plan, expenses, votes; "edited by" hints; activity feed
- [ ] **F6** Stay voting
- [ ] **F9** Add/edit expense, splits (equal/exact/shares), receipts, FX conversion (`/api/cron/fx`)
- [ ] **F9** Budget card, per-person/category breakdown, simplified balances (`lib/money/balances.ts`, unit tested), mark settled
- **Demo:** 4 people on one trip editing live; balances correct.

## Phase 5 — Alerts & story (Weeks 9–10)

- [ ] Notification scheduler (write rows on booking/plan changes) + `/api/cron/notifications` (idempotent)
- [ ] **F10** Daily brief email (React Email) + push; reminders; needs-review alerts; per-trip toggles
- [ ] Web push subscribe flow + iOS "Add to Home Screen" guide
- [ ] In-app notification centre
- [ ] **F11** Album upload + grid + lightbox
- [ ] **F11** Trip story builder, public `/s/[shareId]`, OG image, 1080×1920 export
- [ ] Start Google restricted-scope review (inbox sync) and WhatsApp Business verification for MVP 2
- **Demo:** simulated trip day → brief arrives at 07:00 local; story shared.

## Phase 6 — Admin, QA & closed beta (Weeks 11–12)

- [ ] **F12** Admin panel: waitlist export/invite batches, users, parsing failures, costs, affiliate clicks
- [ ] Playwright flows: sign-up → trip → upload → quiz → plan → invite → expense → story
- [ ] Access tests (non-member cannot read/write any trip data)
- [ ] Performance pass (Lighthouse, bundle size, image optimisation); accessibility audit (axe)
- [ ] Error/empty/loading states review on all screens
- [ ] Privacy: data export & delete; policy text reviewed `[LEGAL REVIEW]`
- [ ] Invite first 50 beta groups from waitlist; feedback widget; analytics dashboard
- **Launch gate:** 50 groups finish a trip, ≥ 80% tickets read without edits.

---

## Not in MVP 1 (do not build)

WhatsApp channel · Gmail/Outlook inbox sync · native apps · public social feed · in-app booking/payments · price alerts · offline mode · dark theme · voice assistant.
