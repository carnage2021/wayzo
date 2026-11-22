# Wayzo — MVP 1 (Web Platform)

> **Upload your tickets. We'll run the trip.**

Wayzo is an AI trip dashboard for group travel. Travellers upload (or email in) their flight, train and hotel bookings, invite their group, and Wayzo builds stay suggestions, food picks, an editable day-by-day plan, a shared budget with expense splitting, a daily morning brief, and a shareable trip story.

**MVP 1 is web only** (responsive web app + installable PWA). WhatsApp is MVP 2 — do not build it now.

---

## Run it locally

Requires **Node 22 LTS** (recommended; Node ≥ 20.9 works with the pinned versions) and pnpm via corepack.

```bash
corepack pnpm@9.15.0 install      # or: npx pnpm@9.15.0 install
cp .env.example .env.local        # fill in the Firebase keys + APP_SECRET
pnpm dev                          # http://localhost:3000
```

The landing page, legal pages and waitlist form work with **no keys at all** (in dev, waitlist sign-ups are logged to the console instead of stored).

### Connect Firebase (needed for sign-in and trips)

1. Firebase console → your project → **Project settings → Your apps → Web app**: copy the config into the `NEXT_PUBLIC_FIREBASE_*` vars.
2. **Project settings → Service accounts → Generate new private key**: paste the whole JSON on one line as `FIREBASE_SERVICE_ACCOUNT_KEY='{...}'`. Server only, never commit it.
3. **Authentication → Sign-in method**: enable **Email/Password** with **Email link (passwordless sign-in)** turned on, and enable **Google**.
4. **Authentication → Settings → Authorised domains**: `localhost` is there by default; add your Vercel domain(s) later.
5. **Firestore Database → Create database** (production mode) and **Storage → Get started**.
6. Deploy the security rules (one time, and after changing them):
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
   ```
7. Optional keys: `RESEND_API_KEY` (waitlist + verification emails), `GEOAPIFY_API_KEY` (city search), `UNSPLASH_ACCESS_KEY` (trip cover photos), Sentry/PostHog.

How the data is laid out and secured: [firebase/README.md](firebase/README.md).

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
app/(auth)/login/       email link + Google sign-in (Firebase Auth)
app/(auth)/auth/callback  completes the emailed sign-in link
app/auth/               signout, verify-email route handlers
app/(app)/onboarding/   first-login profile
app/(app)/(shell)/      My trips, New trip, Account (top-bar shell)
app/(app)/trips/[id]/   trip dashboard shell: dashboard, members, settings, coming-soon sections
app/api/                waitlist, auth session cookie, places autocomplete
components/ui/          design-system kit (Button, Input, Chip, Card, Avatar, Dialog, Sheet, Tabs, …)
components/marketing/   landing sections
lib/                    firebase (admin/client), auth, validation (Zod), trips logic, places, email, rate limit
firebase/               Firestore + Storage security rules, indexes
```

---

## What's in this folder

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Instructions for Claude Code: stack, conventions, rules, build order. **Read first.** |
| `docs/PRD.md` | Product requirements: vision, scope, users, journey, monetization, risks, metrics |
| `docs/FEATURES.md` | Every MVP 1 feature as user stories + acceptance criteria |
| `docs/ARCHITECTURE.md` | System architecture, folder structure, API routes, background jobs |
| `docs/DATA_MODEL.md` | Entities and relations (Firestore layout in `firebase/README.md`) |
| `docs/AI_SPEC.md` | AI jobs, JSON schemas, prompts, guardrails |
| `docs/DESIGN_SYSTEM.md` | Brand, colors, type, spacing, motion, components |
| `docs/ROADMAP.md` | Phase-by-phase task checklist (12 weeks) — the build order |
| `design/landing-page.html` | Final landing page design (open in a browser) |
| `design/splash-screen.html` | App splash screen design |
| `firebase/` | Firestore + Storage security rules and indexes (`firebase.json` points here) |
| `.env.example` | Environment variables needed |

## How to start with Claude Code

1. Create an empty repo folder and copy this whole folder into it.
2. Open it in Claude Code and say:

   > Read `CLAUDE.md` and everything in `docs/`. Then start Phase 1 from `docs/ROADMAP.md`. Show me the plan for Phase 1 before writing code.

3. After each phase, test the demo, then ask Claude Code to tick the boxes in `docs/ROADMAP.md` and move to the next phase.

## Accounts you'll need

- Vercel (hosting) · Firebase (Auth, Firestore, Storage)
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
