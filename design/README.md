# Wayzo designs

Open these files in any browser. They are the final visual reference for MVP 1.

| File | What it shows |
| --- | --- |
| `landing-page.html` | Full marketing site: splash intro, frosted nav, dashboard hero, marquee, problem, scroll text band, sticky "how it works" story, features bento, groups, trust, WhatsApp coming soon, FAQ, waitlist (working validation + success state), footer |
| `splash-screen.html` | App splash screen (loops for preview; in the app it plays once, ≤ 1.5s) |

## Notes for developers

- These are static HTML references. Port them into Next.js components; don't serve them as-is.
- All tokens (colors, fonts, radii, motion) are documented in `docs/DESIGN_SYSTEM.md`.
- The waitlist form has a `TODO` where it should `POST /api/waitlist`.
- The hero dashboard window is the visual direction for the real trip dashboard: dark sidebar, light content, rounded cards, lime accents.
- The "How it works" phone screens are the visual direction for the mobile app screens (upload, quiz, today).
- Placeholders to fill: `[YOUR EMAIL]` in the FAQ.
