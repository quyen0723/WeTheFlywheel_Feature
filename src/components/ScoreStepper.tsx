import { Minus, Plus } from 'lucide-react';
import type { MatchConfig, Score, TeamId } from '../lib/types';

const MIN = 0;
const MAX = 15;

interface ScoreStepperProps {
  match: MatchConfig;
  scores: Score;
  disabled: boolean;
  onChange: (team: TeamId, delta: number) => void;
}

/**
 * Accessible score input. Each team's value is a `spinbutton` (keyboard:
 * Arrow/Home) flanked by labelled +/- buttons. No native number input —
 * the +/- controls lower cognitive load (per the product thesis).
 */
export function ScoreStepper({ match, scores, disabled, onChange }: ScoreStepperProps) {
  const renderTeam = (team: TeamId) => {
    const info = team === 'home' ? match.home : match.away;
    const value = scores[team];
    const label = `${info.name} score`;

    const handleKey = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return;
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault();
          onChange(team, +1);
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault();
          onChange(team, -1);
          break;
        case 'Home':
          e.preventDefault();
          onChange(team, -value);
          break;
      }
    };

    return (
      <div className="flex flex-1 flex-col items-center">
        <div
          className="mb-3 flex h-16 w-16 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-4xl shadow-sm"
          aria-hidden="true"
        >
          {info.flag}
        </div>
        <span className="text-[17px] font-bold text-slate-800">{info.code}</span>
        <span className="mb-4 hidden text-[14px] text-slate-500 md:block">{info.name}</span>

        <div
          className="flex items-center justify-center space-x-3 rounded-full border border-slate-200 bg-slate-50 p-1.5"
          role="group"
          aria-label={label}
        >
          <button
            type="button"
            onClick={() => onChange(team, -1)}
            disabled={disabled || value <= MIN}
            aria-label={`Decrease ${info.name} score`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-all hover:text-slate-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={18} strokeWidth={3} aria-hidden="true" />
          </button>

          <span
            role="spinbutton"
            tabIndex={disabled ? -1 : 0}
            aria-label={label}
            aria-valuenow={value}
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuetext={`${value} goals`}
            aria-disabled={disabled}
            onKeyDown={handleKey}
            className="w-10 text-center text-3xl font-black tracking-tighter text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-brand-amber rounded"
          >
            {value}
          </span>

          <button
            type="button"
            onClick={() => onChange(team, +1)}
            disabled={disabled || value >= MAX}
            aria-label={`Increase ${info.name} score`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={18} strokeWidth={3} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6 flex items-center justify-between md:mb-0">
      {renderTeam('home')}

      <div className="flex flex-col items-center px-4 pb-12 md:pb-0">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold uppercase tracking-widest text-slate-300">
          VS
        </span>
      </div>

      {renderTeam('away')}
    </div>
  );
}