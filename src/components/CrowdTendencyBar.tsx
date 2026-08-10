import { Users } from 'lucide-react';
import type { MatchConfig, Outcome, Score } from '../lib/types';
import { tendencyOf } from '../lib/badge';

interface CrowdTendencyBarProps {
  match: MatchConfig;
  pick: Score;
}

/** Map an outcome to its crowd share + display colour. */
function crowdOf(match: MatchConfig, outcome: Outcome) {
  const pct = match.crowd[outcome];
  const team = outcome === 'home' ? match.home : outcome === 'away' ? match.away : null;
  const label =
    outcome === 'draw' ? 'Draw' : `${team?.code ?? ''} win`;
  return { pct, label };
}

/**
 * "The Herd" — assumed crowd tendency as a stacked bar. The bar itself is
 * decorative (aria-hidden); the legend + live message carry the accessible text.
 * No fabricated prediction count — labelled honestly as "assumed tendency".
 */
export function CrowdTendencyBar({ match, pick }: CrowdTendencyBarProps) {
  const pickTendency = tendencyOf(pick);
  const outcomes: Outcome[] = ['home', 'draw', 'away'];

  const message =
    pickTendency === 'home'
      ? `You're siding with the assumed ${match.crowd.home}% majority backing ${match.home.name}.`
      : pickTendency === 'draw'
        ? `A draw? Only an assumed ${match.crowd.draw}% of managers see it coming.`
        : `Wild — you're defying an assumed ${100 - match.crowd.away}% of the crowd.`;

  const segmentColour: Record<Outcome, { active: string; idle: string; text: string }> = {
    home: { active: 'bg-brand-blue', idle: 'bg-[#93c5fd] opacity-70', text: 'text-brand-blue' },
    draw: { active: 'bg-slate-500', idle: 'bg-slate-300 opacity-70', text: 'text-slate-600' },
    away: { active: 'bg-brand-green', idle: 'bg-[#6ee7b7] opacity-70', text: 'text-brand-green' },
  };

  return (
    <div className="mb-6 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-end justify-between">
        <div className="flex items-center gap-1.5 text-slate-700">
          <Users size={16} className="text-slate-400" aria-hidden="true" />
          <span className="text-[14px] font-bold">The Herd</span>
        </div>
        <span className="text-[12px] font-semibold text-slate-500">Assumed tendency</span>
      </div>

      {/* Decorative bar */}
      <div
        className="relative flex h-4 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner"
        aria-hidden="true"
      >
        {outcomes.map((o) => {
          const c = crowdOf(match, o);
          const isActive = o === pickTendency;
          const tone = segmentColour[o];
          return (
            <div
              key={o}
              style={{ width: `${c.pct}%` }}
              className={`h-full transition-all duration-300 ${isActive ? `${tone.active} z-10` : tone.idle}`}
            />
          );
        })}
      </div>

      {/* Legend — the accessible numbers */}
      <div className="mt-2 flex items-start justify-between text-[11px] font-bold uppercase tracking-wider">
        {outcomes.map((o) => {
          const c = crowdOf(match, o);
          const isActive = o === pickTendency;
          const tone = segmentColour[o];
          return (
            <div
              key={o}
              className={`flex flex-col items-start transition-colors ${
                isActive ? tone.text : 'text-slate-400'
              } ${o === 'draw' ? 'items-center' : o === 'away' ? 'items-end' : ''}`}
            >
              <span>
                {c.label} ({c.pct}%)
              </span>
            </div>
          );
        })}
      </div>

      {/* Live guidance */}
      <p
        className="mt-3 rounded-md border border-slate-100 bg-white px-2 py-1.5 text-center text-[13px] font-medium text-slate-600 shadow-sm"
        aria-live="polite"
      >
        {message}
      </p>
    </div>
  );
}