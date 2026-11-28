# VIDEO_EP01 — Wayzo YouTube Episode 1 (product footage)

Working file for this job. Re-read this instead of the codebase.

## Brief (verbatim)

Task: produce the PRODUCT FOOTAGE for Wayzo YouTube Episode 1 (final video 8–9 min, 16:9). Silent clips only — my voiceover + face cam get added later in a separate edit.

Rules:
- Do NOT edit CLAUDE.md or any app code (except adding demo seed data/scripts under video-ep01/).
- First create VIDEO_EP01.md in the project root: copy this whole brief into it, plus the scene plan below, then work from that file only (re-read it instead of re-reading the codebase). Keep it updated with progress.
- Read only what you need: CLAUDE.md, docs/DESIGN_SYSTEM.md, design/*.html. Don't scan the whole repo.
- All output goes in video-ep01/ (raw/, styled/, graphics/, remotion/, handoff/).
- Use the installed plugins: remotion (graphics + assembly), screenbrowser or Playwright (app recordings), motion-reel only for the logo sting if useful.
- Show only features that really work: splash, sign up, log in, create trip + destination/location, ticket upload. Never fake a working feature in a real recording. Anything else = "Coming next" mockups.
- Demo data only: fictional people (Maya, Sam, Leo), fake tickets with made-up codes (flight LHR→LIS PDF, train ticket screenshot, hotel booking). No real personal data.

Brand: navy #0B1020, lime #D7FF3D, blue #3B5BFF, white text; Bricolage Grotesque 800 + Inter; lowercase "wayzo"; spring motion, words rising through masks, rounded cards, dashed orbit rings, subtle 56px grid on dark. No glitch, lens flares or emoji.

Scene plan (≈ timings):
- S1 Hook 0:00–0:30 — hook montage (~8s: splash, ticket drop, dashboard reveal) + logo sting (2s)
- S2 Who I am 0:30–1:15 — lower third "Mirage · Founder, Wayzo" (transparent)
- S3 Problem 1:15–2:30 — "9 apps" chips cross out → "One trip on Wayzo" (~12s); fictional messy group chat (~8s); card "Where do you want to go?" vs "I already booked." (~6s)
- S4 Idea 2:30–3:15 — landing page slow scroll (15–20s); 3-step graphic: Upload tickets → Tell us your vibe → Travel easy (~10s)
- S5 Demo 3:15–4:00 — splash on open, sign up, log in (real)
- S6 Demo 4:00–5:00 — create trip, destination search, location/map, empty dashboard hold (real)
- S7 Demo 5:00–6:30 — upload flight PDF, train screenshot, hotel booking, hold on each result (real) + transparent callout pills: Flight, Date, Time, From → To, No typing
- S8 Coming next 6:30–7:45 — labelled "Coming next" mockups from design/, ~10s each: group quiz, stays + voting, editable day plan + "ask AI", expenses + who owes who, 7 AM morning brief, WhatsApp "coming soon"
- S9 Ending 7:45–8:30 — end screen 20s: wordmark, "Upload tickets. Travel easy.", empty subscribe + next-video slots

Recording specs: 1920×1080, deviceScaleFactor 2, zoom ~115%, smooth human-like cursor, 2s still padding at clip start/end, 60fps output. Then make *_styled versions: smooth zoom toward cursor on key clicks, lime click ripple, rounded frame with soft shadow on the navy grid background.

Hand-off (video-ep01/handoff/):
1. shotlist.md — scene, file, duration, what it shows, timeline start.
2. rough-cut.mp4 — silent assembly of all clips in scene order at the timings above, with small scene labels.
3. vo-timing.md — numbered voiceover slots per scene with start time + duration (I'll write/record my lines to these).
Keep the Remotion project with reusable components (TitleCard, LowerThird, KineticText, FeatureCard, Callout, Captions, Transition, EndScreen) for the final edit.

Process (stop for my OK at each ★):
- ★1 Plan: clips list, seed data, anything that can't be shown truthfully.
- ★2 Render one sample (S3 "9 apps") for style approval.
- 3 Record app clips → styled versions.
- 4 Render remaining graphics.
- 5 Build rough-cut + hand-off files. Report file list and total runtime.

---

## ★1 Plan

### Tooling
- **Recordings:** Playwright (headed Chromium), driven by a script in `video-ep01/scripts/`.
  - Screenbrowser needs a sign-in that isn't available in this session.
  - Frames are captured over the Chrome DevTools screencast at 3840×2160 (1920×1080 at device scale 2, page zoom 115%), then encoded to constant 60 fps with ffmpeg.
  - The cursor is drawn on the page and moves on eased curves with slight overshoot.
- **Graphics and assembly:** Remotion project in `video-ep01/remotion/`, with the components listed in the brief.
  - Styled clips are rendered by Remotion too: rounded frame, soft shadow, navy 56px grid, zoom toward the cursor on key clicks, lime ripple.
  - Click times and positions come from a JSON log the recorder writes.
- **Logo sting:** Remotion. The brand mark-draw and letter-rise animation already exist; motion-reel isn't needed.
- **App instance:** local production build (`next start`) against the real Neon, MongoDB, UploadThing and OpenRouter accounts. The clips show the app full-frame, with no browser bar or address visible.

### Seed data (all fictional) — `video-ep01/seed/`
| Item | Details |
| --- | --- |
| Demo account | Maya Lopez, `maya.wayzo.demo@example.com` (password stays in the script). Created on camera in S5, then reused for log in. |
| Group | Sam and Leo appear only in graphics and in the tickets' traveller names. The app has no invites yet, so they can't be real trip members. |
| Trip | "Lisbon with friends", destination Lisbon picked from the live search. |
| `flight-LHR-LIS.pdf` | Fictional carrier "SkyPort Air", flight SK 214, LHR 11:05 → LIS 13:40, Fri 9 Apr 2027, code `WZ7K2Q`, passengers Maya Lopez, Sam Okafor, Leo Martin. |
| `train-ticket.png` | Lisbon → Porto, Alfa Pendular 133, Mon 12 Apr 2027 09:00 → 11:49, coach 4, seats 21–23, code `TRN48291`. Rendered as a phone screenshot. |
| `hotel-booking.pdf` | "Casa Alfama Lodge" (fictional), check-in 9 Apr 15:00, check-out 12 Apr 11:00, code `CAL-55210`, 1 room for 3 guests. |

Each ticket is tested once before recording, so the on-camera result is known in advance.

### What can't be shown truthfully, and how I'll handle it
1. **"Splash on open" (S5).** The app splash only plays when Wayzo runs as an installed app, not in a browser tab.
   - Plan: record the landing page's splash intro, which plays in the browser.
   - If that won't work for S5, I can try recording with the browser emulating installed-app mode. That is the real splash code, but it's arguably not "opening the app". You decide.
2. **"Location / map" (S6).** There is no map view yet.
   - What's real: destination search with live suggestions, and the cover photo for the place.
   - Plan: show those, and add a map mockup labelled "Coming next" to S8.
3. **Ticket reading time (S7).** Each ticket takes about 45–70 s to read on the free AI models.
   - Plan: speed up the wait with a visible "sped up ×8" label. Nothing is cut out invisibly.
4. **Sign-up options (S5).** Only email + password are shown. Google isn't configured, so the Google button won't appear.
5. **The upload screen shows the forwarding email address as "Coming soon".** That's left as is, because it's the truth.
6. **S8 mockups** are rebuilt from `design/landing-page.html` and every one carries a "Coming next" badge:
   - group quiz;
   - stays with voting;
   - day plan with "Ask AI";
   - expenses with who owes whom;
   - 7 AM brief;
   - WhatsApp "coming soon";
   - map (from item 2).
7. **The S1 "dashboard reveal"** uses the real dashboard of the demo trip after the tickets are added.

### Clips list
| ID | Kind | Length | Content |
| --- | --- | --- | --- |
| S1-hook | graphic + real | ~8 s | splash, ticket drop, dashboard reveal (from S5–S7 recordings) |
| S1-sting | graphic | 2 s | logo sting |
| S2-lowerthird | graphic (transparent .mov, ProRes 4444) | ~6 s, reusable | "Mirage · Founder, Wayzo" |
| S3-nine-apps | graphic | ~12 s | **★2 sample** |
| S3-group-chat | graphic | ~8 s | fictional messy chat |
| S3-versus | graphic | ~6 s | "Where do you want to go?" vs "I already booked." |
| S4-landing-scroll | real | ~18 s | slow scroll of the landing page |
| S4-three-steps | graphic | ~10 s | Upload tickets → Tell us your vibe → Travel easy |
| S5-signup-login | real | ~40 s | splash, sign up, onboarding, sign out, log in |
| S6-create-trip | real | ~50 s | new trip, destination search, cover, empty dashboard |
| S7-upload-flight / -train / -hotel | real | ~25 s each (after speed-up) | three uploads, hold on each result |
| S7-callouts | graphic (transparent) | — | Flight · Date · Time · From → To · No typing |
| S8-coming-next-1..7 | graphic | ~10 s each | the mockups listed above |
| S9-endscreen | graphic | 20 s | wordmark, tagline, empty subscribe and next-video slots |

Silent throughout. Media stays out of git: I'll add `video-ep01/**/*.mp4` and `*.mov` to `.gitignore`. The scripts and the Remotion source are kept.

### Cost and time notes
- Ticket test runs plus the recording takes use about 8–12 AI calls, out of a free quota of 50 a day.
- Afterwards the demo account is deleted.

## Progress
- [x] ★1 Plan approved (realistic-looking fictional tickets; no map; email + password; landing splash intro)
- [x] ★2 S3 "9 apps" sample rendered and approved (video-ep01/graphics/S3-nine-apps.mp4)
- [x] 3 App clips recorded (raw/, 4K 60 fps + event logs) and styled (styled/*_styled.mp4). Re-recorded S6/S7 after fixing date entry (dd-mm locale) and destination pick (Lisbon, Portugal).
- [x] 4 Graphics: S1 hook + sting, S2 lower third (.mov alpha), S3 chat + versus, S4 three steps, S7 callouts (.mov alpha), S8 six Coming-next mockups (no map), S9 end screen
- [x] 5 handoff/: rough-cut.mp4 (silent, 8:59), shotlist.md, vo-timing.md; extra: draft-narration.wav + rough-cut-with-draft-vo.mp4 (AI voice, guide only)

Re-render: `bash video-ep01/scripts/render-all.sh [styled|graphics|rough]`, docs: `node video-ep01/scripts/handoff.mjs`, narration: `bash video-ep01/scripts/narration.sh`. Delete `video-ep01/remotion/out/bundle` after editing src so it re-bundles.
