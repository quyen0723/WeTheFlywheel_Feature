import { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, TrendingUp } from 'lucide-react';

import { AppHeader } from './components/AppHeader';
import { ScoreStepper } from './components/ScoreStepper';
import { CrowdTendencyBar } from './components/CrowdTendencyBar';
import { BadgeResult } from './components/BadgeResult';
import { useReducedMotion } from './hooks/useReducedMotion';
import { MATCH } from './data/match';
import { computeBadge, scoreDuel } from './lib/badge';
import { confettiColors } from './tokens';
import type { Badge, DuelScore, Score, TabId } from './lib/types';

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'division', label: 'My Division' },
  { id: 'history', label: 'History' },
];

const MIN = 0;
const MAX = 15;
const clamp = (n: number) => Math.max(MIN, Math.min(MAX, Number.isFinite(n) ? n : 0));

/** Restore a shared pick from the URL so a "Challenge a friend" link recreates it. */
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
  const [showResult, setShowResult] = useState<boolean>(initial.locked);
  const [revealed, setRevealed] = useState(false);
  const [duel, setDuel] = useState<DuelScore | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('division');
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  const shareUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}?h=${scores.home}&a=${scores.away}&locked=1`,
    [scores.home, scores.away],
  );

  // Reset the "copied" toast.
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleScoreChange = (team: 'home' | 'away', delta: number) => {
    if (isLocked) return;
    setScores((prev) => ({ ...prev, [team]: clamp(prev[team] + delta) }));
  };

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [...confettiColors],
      });
    } catch {
      /* graceful no-op — never block the UX if the lib/canvas is unavailable */
    }
  };

  const handleLock = () => {
    if (isLocked) return;
    const b = computeBadge(MATCH, scores);
    setBadge(b);
    setIsLocked(true);
    setShowResult(true);
    writeUrl(scores, true);
    if (!reduced) fireConfetti();
  };

  const handleReveal = () => {
    if (!MATCH.realResult) return;
    setRevealed(true);
    setDuel(scoreDuel(scores, MATCH.realResult));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* clipboard may be blocked; the share URL is still rendered for manual copy */
    }
    setCopied(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#F8FAFC] font-sans text-slate-800">
      <AppHeader tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-x-0 top-[60px] z-0 h-[300px] overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-50 to-transparent opacity-50 blur-3xl" />
      </div>

      <main className="relative z-10 w-full max-w-md md:mt-12 mt-6 mx-4 mb-[14px] md:max-w-3xl">
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
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 8px)',
                }}
                aria-hidden="true"
              />
              <span className="relative z-10 mb-1 inline-block rounded-full bg-brand-amber/20 px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-brand-amber">
                Match of the Day
              </span>
              <h2 className="relative z-10 text-[17px] font-bold tracking-tight text-white">
                {MATCH.label}
              </h2>
            </div>

            <div className="p-[16px_20px] md:p-[24px_32px]">
              <div className="flex flex-col md:flex-row md:items-center md:gap-10">
                {/* Score input */}
                <div className="w-full flex-1 md:border-r md:pr-10 border-slate-100">
                  <div className={`transition-opacity duration-300 ${isLocked ? 'opacity-60' : 'opacity-100'}`}>
                    <ScoreStepper match={MATCH} scores={scores} disabled={isLocked} onChange={handleScoreChange} />
                  </div>
                </div>

                {/* Crowd + submit */}
                <div className="mt-6 w-full flex-1 md:mt-0">
                  <CrowdTendencyBar match={MATCH} pick={scores} />
                  <button
                    type="button"
                    onClick={handleLock}
                    disabled={isLocked}
                    className={`w-full rounded-[10px] py-[12px] px-6 text-[17px] font-bold shadow-sm transition-all ${
                      isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-brand-amber text-slate-900 hover:bg-brand-amber-dark'
                    }`}
                  >
                    {isLocked ? 'Locked' : 'Lock Prediction'}
                  </button>
                </div>
              </div>

              {/* Result */}
              {showResult && badge && (
                <div className="mt-8">
                  <BadgeResult
                    match={MATCH}
                    pick={scores}
                    badge={badge}
                    revealed={revealed}
                    duel={duel}
                    onReveal={handleReveal}
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
            className="rounded-[10px] border border-slate-200 bg-white p-12 text-center shadow-sm"
          >
            <div className="flex flex-col items-center justify-center text-slate-400">
              <TrendingUp size={48} className="mb-4 opacity-50" aria-hidden="true" />
              <h2 className="mb-2 text-[19px] font-bold text-slate-700">Prediction History</h2>
              {!isLocked ? (
                <p className="text-[14px]">
                  Make your first prediction in the <strong>My Division</strong> tab to see it here.
                </p>
              ) : (
                <div className="mt-6 w-full max-w-sm text-left">
                  <h3 className="mb-3 border-b pb-2 text-[13px] font-bold uppercase tracking-wider text-slate-500">
                    Recent pick
                  </h3>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <span className="font-semibold text-slate-700">
                      {MATCH.home.code}{' '}
                      <span className="text-brand-blue">
                        {scores.home}–{scores.away}
                      </span>{' '}
                      {MATCH.away.code}
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-[12px] font-bold text-green-700">
                      {badge?.title ?? 'Locked'}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500">
                    <ShieldCheck size={14} aria-hidden="true" /> Settled picks will show EXACT/TEND scoring.
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <p className="mt-4 mb-12 text-center text-[14px] tracking-wide text-slate-500">
          Tipmaster Football Manager · World Cup Edition
        </p>
      </main>
    </div>
  );
}