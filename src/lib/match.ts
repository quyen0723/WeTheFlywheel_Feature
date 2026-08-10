import type { MatchConfig, MatchStatus, SimState } from './types';

const HOUR = 3_600_000;
const MIN = 60_000;

/**
 * Derive the match lifecycle from its kickoff time vs a reference "now".
 * - upcoming: before kickoff
 * - live:     between kickoff and kickoff + durationMin
 * - ended:    after the live window (or if the kickoff date is unparseable)
 */
export function matchStatus(match: MatchConfig, nowMs: number): MatchStatus {
  const kickoff = Date.parse(match.kickoff);
  if (Number.isNaN(kickoff)) return 'ended';
  const end = kickoff + (match.durationMin ?? 90) * MIN;
  if (nowMs < kickoff) return 'upcoming';
  if (nowMs < end) return 'live';
  return 'ended';
}

/**
 * Reference "now" for the demo state switcher.
 * `auto` uses the real wall clock; the others simulate a moment relative to
 * kickoff so a reviewer can experience the full upcoming → live → ended flow
 * even though this match has already finished.
 */
export function simulatedNow(match: MatchConfig, sim: SimState): number {
  const kickoff = Date.parse(match.kickoff);
  if (sim === 'auto' || Number.isNaN(kickoff)) return Date.now();
  switch (sim) {
    case 'upcoming':
      return kickoff - 24 * HOUR;
    case 'live':
      return kickoff + 60 * MIN;
    case 'ended':
      return kickoff + 5 * HOUR;
    default:
      return Date.now();
  }
}