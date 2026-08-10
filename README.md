# Tipmaster · Crowd Defier — World Cup 2026

A small, self-contained prediction widget for **tipmaster.de — World Cup**: pick a
scoreline for the Match of the Day, see how you sit against the herd, lock your tip,
earn a psychological badge, and **settle the duel live** against the verified real
result. Built as a quality, deployable React + TypeScript app.

> Companion analysis: `../logs/.quyen/docs/01-requirement-analysis.md` and
> `../logs/.quyen/docs/02-build-plan.md` (45-min vanilla variant + strategy).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + bundle to dist/
npm run preview  # preview the production build
```

Requires Node 18+.

## Deploy

Vercel auto-detects Vite (`vercel.json` pins the framework). Any static host that
serves `dist/` works. `npm run build` outputs `dist/`.

## Structure

```
src/
  components/
    AppHeader.tsx        # sticky nav, ARIA tablist, labelled icon buttons
    ScoreStepper.tsx     # accessible spinbutton +/- score input (keyboard)
    CrowdTendencyBar.tsx # "the herd" stacked bar (honest "assumed" tendency)
    BadgeResult.tsx      # badge + EXACT/TEND bridge + settle-live + share
  hooks/
    useReducedMotion.ts  # gates non-essential motion (WCAG 2.3.3)
  lib/
    types.ts             # shared domain types
    badge.ts             # PURE scoring: computeBadge, scoreDuel, tendencyOf
  data/
    match.ts             # Match of the Day + verified real result + crowd
  tokens.ts              # verified Tipmaster palette (JS side)
  index.css              # Tailwind v4 @theme + custom utilities + reduced-motion
  App.tsx                # state orchestration, deep-link, confetti gating
```

## Key technical choices (deliberate)

- **Pure scoring logic** (`lib/badge.ts`) — no React/DOM, unit-testable. Mirrors the
  real Tipmaster Standings columns: **EXACT** (exact scoreline) and **TEND**
  (tendency). The user's pick *is* the EXACT attempt; TEND is derived from it.
- **No LLM in the loop.** Badges come from an explicit, inspectable rule
  (Goal Difference → tendency → herd comparison). This is the deliberate antidote to
  "cookie-cutter AI output anyone can prompt their way to" — the model is transparent,
  not a black-box prediction.
- **Honest mock data.** The crowd tendency is labelled "assumed/illustrative" and no
  fabricated prediction count is shown — avoids posing mock figures as real.
- **Verified real result.** Settle-live uses the actual 2026 World Cup Final
  (Spain 1–0 Argentina, a.e.t., 19 Jul 2026) with source provenance — so the
  "Mad Genius" who tipped Spain is provably, historically right.
- **Accessibility-first.** ARIA tablist, `role="spinbutton"` with arrow-key support,
  labelled icon buttons, `aria-live` regions, `<main>` landmark, and
  `prefers-reduced-motion` respected (CSS + confetti gating).
- **Zero build-config debt.** Tailwind v4 via its Vite plugin (no postcss/config.js).
  Custom utilities the original referenced but never defined (`no-scrollbar`,
  `mask-fade-edges`, `animate-bounce-slow`) are now real.

## Known limits (honest)

- Crowd tendency is illustrative, not real market data.
- Single Match of the Day (no bracket) — scope kept tight on purpose.
- UI is English; tipmaster.de targets the German market (i18n is a clear next step).
- `lucide-react` + `canvas-confetti` are runtime deps (the 45-min vanilla variant
  in `02-build-plan.md` drops these for a single self-contained HTML file).