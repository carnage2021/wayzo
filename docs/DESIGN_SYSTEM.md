# Wayzo Design System

Source of truth for visuals: `design/landing-page.html` and `design/splash-screen.html`. The web app uses the same tokens.

## Brand

- **Name:** wayzo (always lowercase in the wordmark)
- **Tagline:** Upload tickets. Travel easy.
- **Logo mark:** lime rounded square (radius ≈ 30% of size) with a navy wavy route line: SVG path `M3.5 17.5c3-8.5 6-10.5 8.5-10.5s3 3 5 3 3.5-2.5 3.5-2.5` on a 24×24 viewBox, stroke 2.4, round caps.
- **Voice:** friendly, short, confident. Talks like a well-travelled friend. No jargon, no emoji in UI.

## Colors

| Token | Hex | Use |
| --- | --- | --- |
| `--ink` | `#0B1020` | Primary dark, text on light, dark sections, primary buttons |
| `--ink-2` | `#151B2E` | Dark cards |
| `--ink-3` | `#1F2740` | Dark bubbles / raised dark |
| `--lime` | `#D7FF3D` | Brand accent, primary CTA on dark, highlights (text on lime is always `--ink`) |
| `--blue` | `#3B5BFF` | Secondary accent, links, eyebrows, focus |
| `--blue-strong` | `#2A4BFF` | User chat bubbles, pressed |
| `--white` | `#FFFFFF` | Surface |
| `--mist` | `#F2F4F8` | Alternate section background, light cards |
| `--line` | `#DCE1EA` | Borders, inputs |
| `--text-muted` | `#4B5565` | Body text on light |
| `--text-muted-dark` | `#A3ACBE` | Secondary text on dark |
| `--success` | `#1F7A3D` | Success text |
| `--error` | `#B42318` | Error text (border `#D92D20`) |
| Avatars | `#FFB4A2`, `#A7F3D0`, `#C9D3FF` | Member avatar fills |

Dark hero/section background: `--ink` + 56px grid of 1px lines at `rgba(255,255,255,.045)`.

## Typography

- **Display:** Bricolage Grotesque 700/800, letter-spacing −0.025em
- **Body/UI:** Inter 400/500/600/700

| Style | Size | Weight | Line height |
| --- | --- | --- | --- |
| Hero H1 | clamp(44px, 5.8vw, 80px) | 800 | 0.98 |
| Section H2 | clamp(38px, 4.6vw, 60px) | 800 | 1.02 |
| H3 card | 26–34px | 700–800 | 1.1 |
| Eyebrow | 13px uppercase, tracking .14em | 700 | — |
| Body L | 18px | 400 | 1.65 |
| Body | 16px | 400 | 1.6 |
| Small | 13–14px | 500–600 | 1.45 |

App UI: same families; page titles 28–32px display, card titles 18–22px display, body 15–16px.

## Spacing, radius, shadow

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 96, 128
- Section padding: 128px desktop / 80px mobile
- Container: max-width 1200px, side padding 24px
- Radius: chips/buttons 999px · inputs 16px · small cards 14–18px · cards 28–32px · big panels 36–40px · phone 44–46px
- Shadows: card hover `0 28px 56px rgba(11,16,32,.12)` · floating `0 28px 60px rgba(0,0,0,.35)` · lime CTA hover `0 14px 36px rgba(215,255,61,.38)`

## Components

- **Buttons:** pill, min-height 52px (44px in nav/compact). Variants: lime (on dark), ink (on light), ghost (outline on dark). Hover: lift 2px + glow; active: scale .98; arrow icon slides 4px on hover.
- **Inputs:** 58px tall, 16px radius, 1.5px `--line` border, icon left; focus → blue border + 4px blue ring at 14%; error → red border + shake.
- **Chips (selectable):** 44px, pill, outline; selected = ink fill, white text; `aria-pressed`.
- **Cards:** big radius, no left-border accents, no gradients; lift 8px on hover.
- **Eyebrow + H2** header pattern on every section.
- **Avatars:** 28–32px circles with 2px surface border, overlapped −8px.
- **Icons:** 1.75–2.4 stroke line icons (Lucide set is fine).

## Motion

| Pattern | Spec |
| --- | --- |
| Easing | `cubic-bezier(.2,.7,.2,1)` (out), curtains `cubic-bezier(.76,0,.24,1)` |
| Splash | Mark pops in (scale .4→1, rotate −20°→0), route line draws (stroke-dashoffset 100→0, 1.1s), letters rise staggered 80ms, curtain slides up at 2.3s, lime curtain 150ms after |
| Hero | Words rise through masks, 80ms stagger |
| Scroll reveal | Fade + 56px up (or ±72px sideways / scale .9), 1s, stagger 80ms; only for below-the-fold elements |
| Scroll-linked | Progress bar scaleX; parallax ×0.08; text bands translateX ×0.28 |
| Sticky story | Phone pinned; screens cross-fade + 24px rise on step change |
| Loops | Float 6–7s, dashed orbit rings 40–60s, pulse dot 2s, marquee 40s (pause on hover) |
| Success | Check ring pops (scale .6→1.08→1), check path draws |
| Reduced motion | All of the above off |

In the app, use Framer Motion with the same durations/easing; keep app motion subtle (page transitions 200–300ms, list items 150ms).
