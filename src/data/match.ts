import type { MatchConfig } from '../lib/types';

/**
 * Match of the Day — the verified 2026 World Cup Final.
 *
 * Real result: Spain 1–0 Argentina (after extra time, Ferran Torres 106').
 * Date: 2026-07-19, MetLife Stadium. Sources: FIFA / AP / ESPN / BBC / Al Jazeera.
 *
 * Narrative fit for "Crowd Defier": Argentina (defending champion) was the crowd
 * favourite; Spain were the underdog who WON. A user who picks Spain is a
 * "Mad Genius" — and, against the herd, *right*. Settle-live rewards that.
 *
 * `crowd` is an ILLUSTRATIVE, ASSUMED tendency (not real data) — framed honestly
 * in the UI to avoid posing fabricated figures as real (hiring-test R1 risk).
 */
export const MATCH: MatchConfig = {
  id: 'wc2026-final',
  label: 'World Cup 2026 — Final',
  // Verified: 3:00 PM ET = 19:00 UTC, 19 Jul 2026, MetLife Stadium.
  kickoff: '2026-07-19T19:00:00Z',
  kickoffLabel: 'Sun, 19 Jul 2026 · 15:00 ET · MetLife Stadium',
  home: { code: 'ARG', name: 'Argentina', flag: '🇦🇷' },
  away: { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
  // Final went to extra time (Torres 106') + halftime show → ~150 min live window.
  durationMin: 150,
  crowd: { home: 70, draw: 20, away: 10 },
  realResult: { home: 0, away: 1 },
  realResultSource:
    'Spain 1–0 Argentina (a.e.t.) — FIFA/AP/ESPN/BBC, 19 Jul 2026',
};