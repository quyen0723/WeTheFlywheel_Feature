/** Shared domain types for the Crowd Defier widget. */

export type TeamId = 'home' | 'away';
export type TabId = 'division' | 'history';
export type Outcome = 'home' | 'draw' | 'away';

export interface Score {
  home: number;
  away: number;
}

export interface TeamInfo {
  /** Short code shown under the flag, e.g. "ARG". */
  code: string;
  /** Full team name, e.g. "Argentina". */
  name: string;
  /** Emoji flag used as an image-free, zero-network asset. */
  flag: string;
}

export interface CrowdTendency {
  /** Illustrative/assumed crowd share per outcome (must sum to 100). NOT real data. */
  home: number;
  draw: number;
  away: number;
}

export interface MatchConfig {
  id: string;
  /** Headline label, e.g. "World Cup 2026 — Final". */
  label: string;
  home: TeamInfo;
  away: TeamInfo;
  /** Assumed crowd tendency — explicitly illustrative, never posed as real. */
  crowd: CrowdTendency;
  /** Verified real result, present once the match is settled. */
  realResult?: Score;
  /** Provenance for `realResult` (source + date). */
  realResultSource?: string;
}

export type BadgeId = 'safe' | 'risk' | 'genius';
export type BadgeTone = 'amber' | 'cyan' | 'red';

export interface Badge {
  id: BadgeId;
  title: string;
  desc: string;
  /** Crowd share that aligns with this pick — used in the description. */
  crowdShare: number;
  tone: BadgeTone;
}

/** Outcome of comparing a pick against the verified real result. */
export interface DuelScore {
  exact: boolean;
  tend: boolean;
}