# Wayzo MVP 1 — Feature Specs

Each module lists user stories and **acceptance criteria (AC)**. A feature is done only when every AC passes on mobile (375px) and desktop.

Roles: **Owner** (created the trip), **Member** (joined), **Visitor** (not logged in), **Admin** (Wayzo staff).

---

## F1. Marketing site & waitlist

**Stories**
- As a visitor, I understand what Wayzo does in 5 seconds and can join the waitlist.

**AC**
- [ ] Landing page matches `design/landing-page.html` pixel-close: splash intro, nav that turns frosted on scroll, top scroll-progress bar, dashboard hero, destination marquee, problem section, scroll-linked text band, sticky "How it works" story (3 steps, screen changes on scroll), features bento, groups, trust, WhatsApp "coming soon", FAQ accordion, waitlist, footer with large wordmark.
- [ ] Scroll reveals use IntersectionObserver; only elements below the fold are hidden initially (no flash of hidden content).
- [ ] `prefers-reduced-motion`: no splash, no reveals, no loops.
- [ ] Waitlist: email (validated) + "who do you travel with" (Solo / Partner / Friends / Family, default Friends). Invalid email → field shakes + error text. Valid → success state with check animation and their email.
- [ ] `POST /api/waitlist` stores `{email, travels_with, source(utm)}`; duplicates return success without creating a second row; rate-limited (5/min/IP).
- [ ] Confirmation email sent via Resend.
- [ ] SEO: title, description, Open Graph image, favicon, `robots.txt`, `sitemap.xml`. Lighthouse ≥ 90 on Performance/Accessibility/SEO.
- [ ] Privacy and Terms pages (placeholder legal text marked `[LEGAL REVIEW]`).

---

## F2. Auth & account

**Stories**
- As a user, I sign in with a magic link or Google, without a password.
- As a user, I can add extra email addresses so bookings forwarded from them are recognised.
- As a user, I can delete my account and data.

**AC**
- [ ] Better Auth: email + password (with password reset) and Google. Session persists; sign-out works.
- [ ] Animated splash (see `design/splash-screen.html`) shows on PWA launch only (not on every navigation), max 1.5s.
- [ ] Onboarding (first login): name, home city, default currency, food preference, notification opt-in (push prompt + email default ON). Skippable.
- [ ] Account page: edit profile, manage extra emails (verification email required), notification defaults, delete account (typed confirmation; deletes user data, removes from trips, transfers ownership to the oldest member or deletes trip if alone).

---

## F3. Trips & members

**Stories**
- As an organiser, I create a trip in seconds and invite my group.
- As a member, I join from a link and see everything.

**AC**
- [ ] Create trip: name (required), destinations (Places autocomplete, multiple), start/end dates (optional — can be filled from tickets), trip currency (defaults to user currency), auto cover image from destination (Places photo).
- [ ] Each trip gets a unique `inbound_code` → forwarding address `trip-<code>@in.wayzo.app`, shown with a copy button.
- [ ] My trips page: tabs Upcoming / Ongoing / Past; cards show cover, name, dates, member avatars, countdown.
- [ ] Invite by email (sends invite email) or share link (token, revocable, expires in 14 days). Join requires login. Pending invites listed with resend/cancel.
- [ ] Roles: Owner can edit everything, remove members, revoke links, delete trip. Members can add/edit bookings, plan items, expenses, photos, and vote.
- [ ] Trip dashboard: before trip → countdown + checklist ("Upload tickets", "Invite group", "Take quiz", "Pick a stay"); during trip → "Today" card; always → members, budget used, stay coverage (nights covered / total), recent activity, quick-upload dropzone.
- [ ] All trip data updates live for every member (realtime layer, e.g. Pusher/Ably, in a later phase).

---

## F4. Ticket intake

**Stories**
- As a member, I drop in any booking file or forward the email and it lands in the right place.

**AC**
- [ ] Upload: drag & drop (desktop), file picker, mobile camera/screenshot. Types: PDF, JPG, PNG, HEIC, WEBP. Max 15 MB/file, 10 files per batch. Progress shown per file.
- [ ] Inbound email webhook `POST /api/inbound-email` (signature verified). Sender must match a member's verified email; else auto-reply "join the trip first" and log.
- [ ] Pipeline (see `docs/AI_SPEC.md`): extract text → AI parse → match to trip/day → confidence check → save.
- [ ] Confidence ≥ 0.85 on all key fields → status `confirmed`, toast "Added … · Undo" (undo for 10s).
- [ ] Lower confidence → status `needs_review`; review screen shows the source preview next to editable fields, uncertain fields highlighted; Confirm / Discard.
- [ ] Booking dates outside trip dates → ask "Extend trip to include this?".
- [ ] Duplicate (same `provider` + `booking_code`) → not added, toast "Already in this trip".
- [ ] Supported types: flight, train, bus, ferry, stay (hotel/apartment/villa/hostel), car rental, restaurant, activity/tour, event.
- [ ] Bookings page: timeline grouped by day, icons by type, who added it, open source file, edit, delete.
- [ ] On save: reminders scheduled (F10), stay gaps recalculated (F6), itinerary fixed items updated (F8).
- [ ] Trip with no dates: first tickets set start/end dates and destination automatically.

---

## F5. Preference quiz

**Stories**
- As a member, I tell Wayzo what I like in under a minute; the group's answers are combined fairly.

**AC**
- [ ] One question per screen, tap to answer, progress bar, back button:
  1. Stay budget per night per person (slider, trip currency)
  2. Daily food budget per person (slider)
  3. Stay type (multi: hotel, apartment, villa, resort, hostel)
  4. Diet (vegetarian, vegan, halal, kosher, gluten-free, no restrictions)
  5. Drinks & nightlife (love it / sometimes / no)
  6. Pace (relaxed / balanced / packed)
  7. Interests (multi: beaches, nature, culture & history, food, nightlife, adventure, shopping, art, wellness)
- [ ] Group merge: diet = union of restrictions (strictest); budgets = median; stay type = most chosen; nightlife = majority; pace = median; interests = top 5 by votes. Rules in code (`lib/prefs/merge.ts`) with unit tests.
- [ ] Group summary card shows merged result and "3 of 4 answered".
- [ ] Editing answers marks the plan as "update available" (user clicks "Refresh suggestions").

---

## F6. Stay suggestions

**AC**
- [ ] Stay gaps = trip nights with no `stay` booking. Shown on dashboard ("2 nights need a stay").
- [ ] For each gap: 6–10 options from Places (lodging) near the centroid of that period's planned places (or city centre), filtered by group profile (type, budget via price level, rating ≥ 4.0, operational).
- [ ] Card: photo, name, rating + review count, price level/range, distance to key spots, one-line AI reason, vote button (count + avatars), "Book" button.
- [ ] "Book" opens partner site (affiliate deep link, new tab) and logs a click event.
- [ ] Sort: votes desc, then AI score. Filters: type, price, rating.
- [ ] When a stay booking is later uploaded for those nights, the gap closes and suggestions hide.

---

## F7. Food & places

**AC**
- [ ] Per trip day: breakfast, lunch, dinner, cafés, bars (bars only if nightlife ≠ "no") near that day's planned area.
- [ ] Filters: diet-friendly, price level, rating ≥ 4.0, open at the planned time.
- [ ] "Must-see" list for each destination: top sights with best time to visit and typical duration (AI summary over Places data).
- [ ] "Add to plan" puts the place in the chosen day/time slot.
- [ ] Every item has a valid `place_id`; closed places never shown.

---

## F8. Itinerary builder

**AC**
- [ ] "Generate plan" creates a day-by-day draft built around fixed bookings (arrival, check-in/out, departures, reservations), respecting pace, interests, opening hours and travel time.
- [ ] Day tabs + list view; each item: time, place, note, map link, travel time to next item (Distance Matrix, cached).
- [ ] Drag & drop to reorder within a day and move across days (dnd-kit); times recalculated; fixed bookings locked (lock icon).
- [ ] Add item: place search (autocomplete) or free-text note.
- [ ] Ask AI bar: "add a sunset spot on day 2", "make day 3 relaxed" → AI returns a proposed diff; user sees highlighted changes and clicks Accept / Reject.
- [ ] Map view per day with numbered pins and route line.
- [ ] Live sync: other members' edits appear without refresh; simple last-write-wins with "edited by Maya" hint.

---

## F9. Expenses & settle-up

**AC**
- [ ] Add expense: amount, currency (any ISO), paid by, split (equal among selected / exact amounts / shares), category (stay, food, transport, activities, shopping, other), note, receipt photo, date.
- [ ] Convert to trip currency with the day's FX rate (stored on the expense).
- [ ] Budget card: planned budget (from quiz × days × people, editable) vs spent; per person and per category breakdown.
- [ ] Balances: simplified debts (min cash flow algorithm) in `lib/money/balances.ts` with unit tests.
- [ ] "Mark as settled" per pair; settled history kept.
- [ ] Money stored as integer minor units.

---

## F10. Notifications

**AC**
- [ ] Daily brief at 07:00 trip-local time on each trip day — email (React Email template) + push: weather, today's items with times, booking codes, one food pick, check-in/out notes.
- [ ] Reminders: night-before (20:00) for departures before 10:00; check-in/out 3h before; flights 3h before; trains/buses 1h before; reservations 1h before.
- [ ] "Needs review" ticket alerts (push + in-app).
- [ ] Group activity: in-app notification centre; optional daily email digest.
- [ ] Per-member, per-trip channel toggles (email / push).
- [ ] Scheduler: `notifications` rows with `fire_at`; a cron (every 5 min) sends due ones idempotently (`sent_at`).
- [ ] PWA: push permission asked after first trip is created (not on landing); iOS users shown "Add to Home Screen" guide.

---

## F11. Album & trip story

**AC**
- [ ] Members upload photos to the trip album (images, max 20 MB each), lazy-loaded grid, lightbox.
- [ ] After end date (or manually), "Create trip story": route map, destinations, days, places visited count, top 8 photos (owner can choose), optional spend per person (off by default).
- [ ] Public share page `/s/[shareId]` (read-only, no personal data beyond first names, owner can unpublish) with OG image.
- [ ] Download as 1080×1920 image for Instagram stories.

---

## F12. Admin panel

**AC**
- [ ] Route `/admin`, only users with `is_admin = true`.
- [ ] Tabs: Waitlist (search, export CSV, send invites in batches), Users, Trips (counts only, no private content by default), Parsing failures (source file + AI output + fix), Costs (AI tokens & Places calls per day), Affiliate clicks.

---

## Non-functional

- [ ] Performance: dashboard interactive < 2.5s on 4G mid-range phone.
- [ ] Accessibility: WCAG 2.1 AA.
- [ ] Privacy: files in private storage buckets with signed URLs; GDPR export & delete.
- [ ] Observability: Sentry errors, PostHog events (`ticket_uploaded`, `ticket_parsed`, `quiz_completed`, `plan_generated`, `stay_clicked`, `expense_added`, `brief_opened`, `story_shared`).
