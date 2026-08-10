import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Lock } from 'lucide-react';

import { AppHeader } from './components/AppHeader';
import { ScoreStepper } from './components/ScoreStepper';
import { CrowdTendencyBar } from './components/CrowdTendencyBar';
import { BadgeResult } from './components/BadgeResult';
import { MatchStatusBar } from './components/MatchStatusBar';
import { HistoryPane } from './components/HistoryPane';
import { useReducedMotion } from './hooks/useReducedMotion';
import { MATCH } from './data/match';
import { computeBadge, scoreDuel } from './lib/badge';
import { matchStatus, simulatedNow } from './lib/match';
import { confettiColors } from './tokens';
import type { Badge, DuelScore, Score, SimState, TabId } from './lib/types';

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'division', label: 'My Division' },
  { id: 'history', label: 'History' },
];

const MIN = 0;
const MAX = 15;
const clamp = (n: number) => Math.max(MIN, Math.min(MAX, Number.isFinite(n) ? n : 0));

function readInitialState(): { scores: Score; locked: boolean } {
  const p = new URLSearchParams(window.location.search);
  const home = clamp(Number.parseInt(p.get('h') ?? '0', 10) || 0);
  const away = clamp(Number.parseInt(p.get('a') ?? '0', 10) || 0);
  return { scores: { home, away }, locked: p.get('locked') === '1' };
}

function writeUrl(scores: Score, locked: boolean) {
  const url = `${window.location.pathname}?h=${scores.home}&a=${scores.away}${locked ? '&locked=1' : ''}`;
  window.history.replaceState(null, '', url);
}

export function App() {
  const initial = useMemo(readInitialState, []);
  const [scores, setScores] = useState<Score>(initial.scores);
  const [isLocked, setIsLocked] = useState<boolean>(initial.locked);
  const [badge, setBadge] = useState<Badge | null>(
    initial.locked ? computeBadge(MATCH, initial.scores) : null,
  );
  const [activeTab, setActiveTab] = useState<TabId>('division');
  const [sim, setSim] = useState<SimState>('auto');
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  // Reference "now" — real wall clock in `auto`, simulated otherwise.
  const now = useMemo(() => simulatedNow(MATCH, sim), [sim]);
  const status = useMemo(() => matchStatus(MATCH, now), [now]);
  const isEnded = status === 'ended';
  const canPredict = !isEnded && !isLocked;

  // Auto-settle the duel once the match has ended and a tip is locked.
  const duel = useMemo<DuelScore | null>(() => {
    if (isEnded && isLocked && MATCH.realResult) return scoreDuel(scores, MATCH.realResult);
    return null;
  }, [isEnded, isLocked, scores]);

  const shareUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}?h=${scores.home}&a=${scores.away}&locked=1`,
    [scores.home, scores.away],
  );

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleScoreChange = (team: 'home' | 'away', delta: number) => {
    if (!canPredict) return;
    setScores((prev) => ({ ...prev, [team]: clamp(prev[team] + delta) }));
  };

  const fireConfetti = () => {
    try {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [...confettiColors] });
    } catch {
      /* graceful no-op */
    }
  };

  const handleLock = () => {
    if (!canPredict) return;
    setBadge(computeBadge(MATCH, scores));
    setIsLocked(true);
    writeUrl(scores, true);
    if (!reduced) fireConfetti();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* clipboard may be blocked; the URL is shown for manual copy */
    }
    setCopied(true);
  };

  const lockLabel = isEnded ? 'Predictions closed' : isLocked ? 'Locked' : 'Lock Prediction';

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] font-sans text-slate-800">
      <AppHeader tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pointer-events-none fixed inset-x-0 top-[60px] z-0 h-[300px] overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-50 to-transparent opacity-50 blur-3xl" />
      </div>

      <main className="relative z-10 mx-4 mb-[14px] mt-6 w-full max-w-md md:mt-12 md:max-w-3xl">
        {activeTab === 'division' ? (
          <section
            role="tabpanel"
            id="panel-division"
            aria-labelledby="tab-division"
            className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm transition-all duration-500"
          >
            {/* Card header */}
            <div className="relative flex flex-col items-center overflow-hidden bg-brand-ink p-[14px_16px]">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 8px)' }}
                aria-hidden="true"
              />
              <span className="relative z-10 mb-1 inline-block rounded-full bg-brand-amber/20 px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-brand-amber">
                Match of the Day
              </span>
              <h2 className="relative z-10 text-[17px] font-bold tracking-tight text-white">{MATCH.label}</h2>
            </div>

            <div className="p-[16px_20px] md:p-[24px_32px]">
              <MatchStatusBar match={MATCH} status={status} sim={sim} onSimChange={setSim} />

              {/* Match finished with no tip locked */}
              {isEnded && !isLocked && MATCH.realResult && (
                <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-3 text-[13px] text-slate-600">
                  <p className="font-semibold text-slate-700">This match has finished — predictions are closed.</p>
                  <p className="mt-1">
                    Real result:{' '}
                    <span className="font-bold text-slate-900">
                      {MATCH.home.code} {MATCH.realResult.home}–{MATCH.realResult.away} {MATCH.away.code}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{MATCH.realResultSource}</p>
                </div>
              )}

              {/* Picker */}
              <div className="flex flex-col md:flex-row md:items-center md:gap-10">
                <div className="w-full flex-1 border-slate-100 md:border-r md:pr-10">
                  <div className={`transition-opacity duration-300 ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
                    <ScoreStepper match={MATCH} scores={scores} disabled={!canPredict} onChange={handleScoreChange} />
                  </div>
                </div>

                <div className="mt-6 w-full flex-1 md:mt-0">
                  <CrowdTendencyBar match={MATCH} pick={scores} />
                  <button
                    type="button"
                    onClick={handleLock}
                    disabled={!canPredict}
                    className={`flex w-full items-center justify-center gap-2 rounded-[10px] py-[12px] px-6 text-[17px] font-bold shadow-sm transition-all ${
                      canPredict
                        ? 'bg-brand-amber text-slate-900 hover:bg-brand-amber-dark'
                        : 'cursor-not-allowed bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Lock size={18} aria-hidden="true" />
                    {lockLabel}
                  </button>
                </div>
              </div>

              {/* Result */}
              {isLocked && badge && (
                <div className="mt-8">
                  <BadgeResult
                    match={MATCH}
                    pick={scores}
                    badge={badge}
                    status={status}
                    duel={duel}
                    shareUrl={shareUrl}
                    onShare={handleShare}
                    copied={copied}
                  />
                </div>
              )}
            </div>
          </section>
        ) : (
          <section
            role="tabpanel"
            id="panel-history"
            aria-labelledby="tab-history"
            className="rounded-[10px] border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12"
          >
            <HistoryPane
              match={MATCH}
              pick={scores}
              hasPick={isLocked}
              status={status}
              duel={duel}
            />
          </section>
        )}

        <p className="mt-4 mb-12 text-center text-[14px] tracking-wide text-slate-500">
          Tipmaster Football Manager · World Cup Edition
        </p>
      </main>
    </div>
  );
}