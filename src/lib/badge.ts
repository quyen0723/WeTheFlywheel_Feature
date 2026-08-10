/**
 * Pure scoring logic — no React, no DOM. Unit-testable.
 *
 * Mirrors the real Tipmaster Standings schema (verified from the product card):
 *   EXACT = called the exact scoreline
 *   TEND. = called the right tendency (W/D/L)
 *   PTS   = total from EXACT + TEND
 */
import type { Badge, DuelScore, MatchConfig, Outcome, Score } from './types';

/** Derive the tendency (W/D/L) of a scoreline. */
export function tendencyOf(s: Score): Outcome {
  if (s.home > s.away) return 'home';
  if (s.home < s.away) return 'away';
  return 'draw';
}

/** Classify a pick into a psychological badge by comparing it to the herd. */
export function computeBadge(match: MatchConfig, pick: Score): Badge {
  const t = tendencyOf(pick);
  const c = match.crowd;

  switch (t) {
    case 'home':
      return {
        id: 'safe',
        title: 'Safe Player',
        desc: `Siding with the herd — you're in the ${c.home}% backing ${match.home.name}.`,
        crowdShare: c.home,
        tone: 'amber',
      };
    case 'draw':
      return {
        id: 'risk',
        title: 'Calculated Risk',
        desc: `A stalemate? Only ${c.draw}% of managers see a draw coming.`,
        crowdShare: c.draw,
        tone: 'cyan',
      };
    case 'away':
      return {
        id: 'genius',
        title: 'Mad Genius',
        desc: `Defying ${100 - c.away}% of the crowd — calling ${match.away.name} to upset.`,
        crowdShare: c.away,
        tone: 'red',
      };
  }
}

/** Would this pick bank EXACT (exact scoreline) against `real`? */
export function isExactHit(pick: Score, real: Score): boolean {
  return pick.home === real.home && pick.away === real.away;
}

/** Would this pick bank TEND (tendency) against `real`? */
export function isTendHit(pick: Score, real: Score): boolean {
  return tendencyOf(pick) === tendencyOf(real);
}

/** Full duel scoring against a settled real result. */
export function scoreDuel(pick: Score, real: Score): DuelScore {
  return { exact: isExactHit(pick, real), tend: isTendHit(pick, real) };
}

/** Human-readable tendency label for a team outcome, e.g. "Argentina win". */
export function tendencyLabel(match: MatchConfig, outcome: Outcome): string {
  if (outcome === 'home') return `${match.home.name} win`;
  if (outcome === 'away') return `${match.away.name} win`;
  return 'Draw';
}