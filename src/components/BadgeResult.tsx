import { AlertTriangle, ArrowRight, Check, Share2, ShieldCheck, Zap } from 'lucide-react';
import type { Badge, BadgeTone, DuelScore, MatchConfig, MatchStatus, Score } from '../lib/types';
import { tendencyLabel, tendencyOf } from '../lib/badge';

interface BadgeResultProps {
  match: MatchConfig;
  pick: Score;
  badge: Badge;
  status: MatchStatus;
  duel: DuelScore | null;
  shareUrl: string;
  onShare: () => void;
  copied: boolean;
}

const TONE: Record<BadgeTone, { icon: typeof ShieldCheck; text: string; bg: string; border: string }> = {
  amber: { icon: ShieldCheck, text: 'text-brand-amber', bg: 'bg-brand-amber/10', border: 'border-brand-amber/20' },
  cyan: { icon: AlertTriangle, text: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/20' },
  red: { icon: Zap, text: 'text-brand-red', bg: 'bg-brand-red/10', border: 'border-brand-red/20' },
};

function verdict(badge: Badge, duel: DuelScore, match: MatchConfig): { line: string; tone: 'good' | 'mid' | 'bad' } {
  if (duel.exact && duel.tend) {
    return { line: 'Bullseye — EXACT scoreline + TEND. Maximum duel points.', tone: 'good' };
  }
  if (duel.tend) {
    if (badge.id === 'genius') {
      return { line: 'Mad Genius — and right. The herd got burned, you called history.', tone: 'good' };
    }
    return { line: 'Tendency right (+TEND). Scoreline off, but the duel bends your way.', tone: 'mid' };
  }
  if (badge.id === 'safe') {
    return { line: `The ${match.home.name} favourite fell — the herd got burned too. No duel points this time.`, tone: 'bad' };
  }
  return { line: 'No duel points — the result went another way.', tone: 'bad' };
}

export function BadgeResult({ match, pick, badge, status, duel, shareUrl, onShare, copied }: BadgeResultProps) {
  const tone = TONE[badge.tone];
  const Icon = tone.icon;
  const pickTend = tendencyOf(pick);
  const settled = status === 'ended' && duel && match.realResult;
  const v = settled ? verdict(badge, duel, match) : null;

  const banked = duel
    ? duel.exact && duel.tend
      ? 'You banked +EXACT and +TEND in this duel.'
      : duel.tend
        ? 'You banked +TEND in this duel (scoreline off).'
        : duel.exact
          ? 'You banked +EXACT in this duel.'
          : 'No duel points — neither EXACT nor TEND.'
    : 'In a Tipmaster duel this banks +EXACT (exact scoreline) and +TEND (tendency) if the real result matches.';

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-md animate-rise">
        <div className={`flex w-full flex-col items-center rounded-[10px] border p-[20px_24px] text-center ${tone.border} ${tone.bg}`}>
          <div className="mb-3 animate-bounce-slow">
            <Icon className={`h-12 w-12 ${tone.text}`} aria-hidden="true" />
          </div>
          <h3 className={`mb-1 text-[19px] font-bold ${tone.text}`}>{badge.title}</h3>
          <p className="mb-5 text-[14px] leading-relaxed text-slate-600">{badge.desc}</p>

          {/* EXACT / TEND bridge — mirrors the real Standings scoring columns */}
          <div className="mb-5 w-full rounded-md border border-slate-200 bg-white p-3 text-left text-[13px] text-slate-600">
            <p className="mb-1 font-semibold text-slate-700">
              Your tip:{' '}
              <span className="font-bold text-slate-900">
                {match.home.code} {pick.home}–{pick.away} {match.away.code}
              </span>
            </p>
            <p className="mb-1">
              Tendency: <span className="font-semibold">{tendencyLabel(match, pickTend)}</span>
            </p>
            <p className="text-slate-500">{banked}</p>
          </div>

          {/* Settled result — shown only once the match has ended */}
          {settled && match.realResult && (
            <div className="mb-4 w-full rounded-md border border-slate-200 bg-white p-3 text-left text-[13px]" aria-live="polite">
              <p className="mb-1 font-semibold text-slate-700">
                Real result:{' '}
                <span className="font-bold text-slate-900">
                  {match.home.code} {match.realResult.home}–{match.realResult.away} {match.away.code}
                </span>
              </p>
              <p className="mb-2 text-[11px] text-slate-400">{match.realResultSource}</p>
              <p
                className={
                  v?.tone === 'good'
                    ? 'font-semibold text-brand-green'
                    : v?.tone === 'mid'
                      ? 'font-semibold text-brand-amber-dark'
                      : 'font-semibold text-brand-red'
                }
              >
                {v?.line}
              </p>
            </div>
          )}

          {/* Share — deep link encodes the pick so a friend opens the same tip */}
          <button
            type="button"
            onClick={onShare}
            className="group flex w-full items-center justify-between rounded-[10px] bg-slate-900 py-[12px] px-4 font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
          >
            <span className="flex items-center gap-2 text-[15px]">
              {copied ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Share2 size={18} className="text-slate-400 group-hover:text-white" aria-hidden="true" />
              )}
              {copied ? 'Link copied!' : 'Challenge a friend'}
            </span>
            <ArrowRight size={18} className="text-slate-400 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
          <p className="mt-2 max-w-md text-[11px] text-slate-400">{shareUrl}</p>
        </div>
      </div>
    </div>
  );
}