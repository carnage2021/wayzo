# Wayzo — MVP 1 (Web Platform)

> **Upload your tickets. We'll run the trip.**

Wayzo is an AI trip dashboard for group travel. Travellers upload (or email in) their flight, train and hotel bookings, invite their group, and Wayzo builds stay suggestions, food picks, an editable day-by-day plan, a shared budget with expense splitting, a daily morning brief, and a shareable trip story.

**MVP 1 is web only** (responsive web app + installable PWA). WhatsApp is MVP 2 — do not build it now.

---

## Run it locally

Requires **Node 22 LTS** (recommended; Node ≥ 20.9 works with the pinned versions) and pnpm via corepack.

```bash
corepack pnpm@9.15.0 install      # or: npx pnpm@9.15.0 install
cp .env.example .env.local        # fill in DATABASE_URL, MONGODB_URI, BETTER_AUTH_SECRET, UPLOADTHING_TOKEN, AI_API_KEY
pnpm db:migrate                   # create the tables in Neon
pnpm dev                          # http://localhost:3000
```

The landing page, legal pages and waitlist form work with **no keys at all** (in dev, waitlist sign-ups are logged to the console instead of stored).

### Connect the backend (needed for sign-in, trips and tickets)

All free, no credit card:

1. **Neon** (neon.tech): create a project, then **Connect** with pooling on. Copy the string into `DATABASE_URL`, then run `pnpm db:migrate`.
2. **MongoDB Atlas** (cloud.mongodb.com): create a free M0 cluster. Under **Database Access**, add a user; under **Network Access**, allow `0.0.0.0/0`. Put the `mongodb+srv://.../wayzo` string in `MONGODB_URI`.
3. **Better Auth**: set `BETTER_AUTH_SECRET` to a long random string and `BETTER_AUTH_URL` to the site URL.
4. **UploadThing** (uploadthing.com): create an app and copy **API Keys -> UPLOADTHING_TOKEN**.
5. **OpenRouter** (openrouter.ai): an API key in `AI_API_KEY` for ticket reading. The free models are listed in `AI_MODELS`.
6. Optional:
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` add "Continue with Google". The redirect URI is `<site>/api/auth/callback/google`.
   - `RESEND_API_KEY` sends emails (password reset, waitlist).
   - `GEOAPIFY_API_KEY` adds city search; `UNSPLASH_ACCESS_KEY` adds cover photos.

How the data is laid out and protected: [docs/BACKEND.md](docs/BACKEND.md).

### Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev / production build / serve |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | ESLint, `tsc --noEmit`, Prettier |
| `pnpm test` | Vitest unit tests (`lib/**/*.test.ts`) |
| `pnpm test:e2e` | Playwright flows (`tests/e2e`; run `pnpm exec playwright install chromium` once) |

### Project layout (Phase 1)

```
app/(marketing)/        landing page, privacy, terms (+ landing.css: design animations)
app/(auth)/login/       email + password (and Google) sign-in, forgot/reset password
app/auth/               continue (post sign-in redirect), signout, verify-email
app/(app)/onboarding/   first-login profile
app/(app)/(shell)/      My trips, New trip, Account (top-bar shell)
app/(app)/trips/[id]/   trip dashboard shell: dashboard, members, settings, coming-soon sections
app/api/                waitlist, auth session cookie, places autocomplete
components/ui/          design-system kit (Button, Input, Chip, Card, Avatar, Dialog, Sheet, Tabs, …)
components/marketing/   landing sections
lib/                    db (Drizzle/Neon), auth (Better Auth), ai, tickets, trips, places, email, validation (Zod)
drizzle/                SQL migrations for Neon
```

---

## What's in this folder

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Instructions for Claude Code: stack, conventions, rules, build order. **Read first.** |
| `docs/PRD.md` | Product requirements: vision, scope, users, journey, monetization, risks, metrics |
| `docs/FEATURES.md` | Every MVP 1 feature as user stories + acceptance criteria |
| `docs/ARCHITECTURE.md` | System architecture, folder structure, API routes, background jobs |
| `docs/DATA_MODEL.md` | Entities and relations (actual tables and access rules in `docs/BACKEND.md`) |
| `docs/AI_SPEC.md` | AI jobs, JSON schemas, prompts, guardrails |
| `docs/DESIGN_SYSTEM.md` | Brand, colors, type, spacing, motion, components |
| `docs/ROADMAP.md` | Phase-by-phase task checklist (12 weeks) — the build order |
| `design/landing-page.html` | Final landing page design (open in a browser) |
| `design/splash-screen.html` | App splash screen design |
| `docs/BACKEND.md` | Where data lives (Neon, MongoDB, UploadThing) and how access is enforced |
| `.env.example` | Environment variables needed |

## How to start with Claude Code

1. Create an empty repo folder and copy this whole folder into it.
2. Open it in Claude Code and say:

   > Read `CLAUDE.md` and everything in `docs/`. Then start Phase 1 from `docs/ROADMAP.md`. Show me the plan for Phase 1 before writing code.

3. After each phase, test the demo, then ask Claude Code to tick the boxes in `docs/ROADMAP.md` and move to the next phase.

## Accounts you'll need

- Vercel (hosting) · Neon (Postgres) · MongoDB Atlas (logins) · UploadThing (files) · OpenRouter (AI)
- Anthropic or Google AI (LLM with vision)
- Geoapify (places + routing, free tier) · Unsplash (cover photos)
- Resend (outgoing email) + Postmark or Resend Inbound (forward-to-trip emails)
- OpenWeather · an exchange-rate API
- Affiliate programmes for stays (e.g. Booking.com, Agoda, Expedia)
- Sentry + PostHog (optional at start)

## Open decisions (fill in)

- Domain / trademark check for "Wayzo": `[TODO]`
- Launch markets, default currency and language: `[TODO]`
- LLM provider (test on 50 real tickets): `[TODO]`
- Wayzo Plus price: `[YOUR PRICE]`
- Contact email: `[YOUR EMAIL]`
