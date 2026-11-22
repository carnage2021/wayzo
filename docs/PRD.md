# Wayzo — Product Requirements (MVP 1, Web Platform)

_Last updated: 2026-11-22_

## 1. Summary

Wayzo is a web-based AI trip dashboard for group travel. Travellers upload their tickets, add their group, and Wayzo runs the trip: stays, food, a day plan, budget, daily briefs and a trip story.

**Pitch:** Upload your tickets. We'll run the trip.
**MVP 1:** responsive web app + installable PWA. **MVP 2:** WhatsApp channel.

## 2. Problem

One trip today needs nine apps: booking emails, screenshots, saved reels, group chats, budget spreadsheets, map pins, notes, split-the-bill apps and endless browser tabs. Groups lose track of what's booked, what's planned and who owes what.

## 3. Positioning

| Competitor type | What they do | Gap Wayzo fills |
| --- | --- | --- |
| AI planners (Mindtrip, Layla) | Inspiration, booking | Start from "where to?", weak on groups, no ticket intake |
| Itinerary organizers (TripIt) | Itinerary from emails | No AI planning, no group budget, no daily brief |
| Expense splitters (Splitwise) | Split costs | Know nothing about the trip |
| Group trip apps | Shared lists, splits | Little AI, manual entry |

Wayzo starts from what's already booked and runs the whole group trip from one dashboard.

## 4. Target users

- International leisure travellers, 22–40
- Group trips: friends, couples, families; 2–8 people; 2–10 days
- **Primary persona — "The organiser":** the one person who always ends up planning. Wants less admin and fewer "what's the plan?" messages.
- **Secondary — "The member":** joins by link, uploads own tickets, votes, adds expenses, reads the brief.

## 5. Scope

| Area | MVP 1 (web) | Later |
| --- | --- | --- |
| Ticket intake | Upload (PDF/image/screenshot) + forward-to-trip email | WhatsApp, inbox sync |
| Planning | Preference quiz, stays, food, editable day plan, AI assistant | Price alerts, itinerary copying |
| Group | Invite by email/link, roles, live sync, stay voting | In-trip chat |
| Money | Expenses, splits, balances, settle-up marking, multi-currency | In-app payments |
| Alerts | Email daily brief, web push reminders | WhatsApp |
| Social | Shared album + public trip story link | Feed, profiles, follows |
| Apps | Web + PWA | Native iOS/Android |
| Marketing | Landing page + waitlist (designed) | SEO destination pages |

## 6. Core user journey

1. Sign up (magic link / Google)
2. Create a trip — or just upload tickets and let AI fill destination and dates
3. Upload tickets or forward booking emails to the trip address; AI reads them; user confirms
4. Invite the group (email/link); their uploads merge into the trip
5. Preference quiz — each member answers; AI blends answers
6. Dashboard fills: stay picks for uncovered nights, food per day, draft day plan around fixed bookings
7. Edit together: drag/drop, add places, vote, ask AI
8. During trip: 7 AM brief (email + push), reminders, expenses
9. After trip: settle up, generate and share trip story

## 7. Monetization

| Stream | When |
| --- | --- |
| Affiliate commission on stay bookings | MVP 1 |
| Wayzo Plus subscription (unlimited AI, WhatsApp brief for group, offline/PDF, HD story video) — `[YOUR PRICE]` | After MVP 1 |
| Sponsored, labelled picks | Later |
| White-label for travel agents | Later |

## 8. Success metrics (beta targets, proposed)

| Metric | Target |
| --- | --- |
| Tickets read correctly without edits | 80% |
| Trips with 2+ members | 60% |
| Members who open the daily brief | 50% |
| Click-through on stay cards | 10% |
| Completed trips that share a story | 30% |
| Waitlist sign-up → first trip created | 40% |
| 2nd trip within 90 days | 25% |

**Launch gate:** 50 beta groups complete a trip and ≥80% of tickets are read without edits.

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Wrong ticket reads | Confidence scores, review screen, undo, admin failure queue |
| Places API cost | Cache per city 7–30 days, field masks, plan per trip not per click |
| LLM cost | Daily cap on free plan, fast model for simple jobs, cache plans |
| Web app forgotten during trip | Email brief, push, add-to-home-screen prompt; WhatsApp in MVP 2 |
| iOS push limits | Home-screen install prompt; email fallback for every alert |
| AI suggests closed/fake places | Live `place_id` only, operating-status check, opening hours |
| Ticket privacy (GDPR etc.) | Encryption, private by default, delete-data, clear policy |

## 10. Out of scope for MVP 1

WhatsApp, inbox sync, native apps, public social feed, in-app booking/payments, price alerts, offline mode, voice assistant, dark theme.
