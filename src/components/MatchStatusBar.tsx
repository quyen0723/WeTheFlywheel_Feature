import { Clock, Radio, CheckCircle2 } from 'lucide-react';
import type { MatchConfig, MatchStatus, SimState } from '../lib/types';

interface MatchStatusBarProps {
  match: MatchConfig;
  status: MatchStatus;
  sim: SimState;
  onSimChange: (sim: SimState) => void;
}

const STATUS_PILL: Record<MatchStatus, { label: string; cls: string; icon: typeof Clock }> = {
  upcoming: { label: 'Upcoming', cls: 'bg-brand-blue/10 text-brand-blue', icon: Clock },
  live: { label: 'Live', cls: 'bg-brand-red/10 text-brand-red', icon: Radio },
  ended: { label: 'Finished', cls: 'bg-slate-200 text-slate-600', icon: CheckCircle2 },
};

const SIM_OPTIONS: ReadonlyArray<{ id: SimState; label: string }> = [
  { id: 'auto', label: 'Actual' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'live', label: 'Live' },
  { id: 'ended', label: 'Finished' },
];

/** Kickoff line, status pill, and a labelled demo-state switcher. */
export function MatchStatusBar({ match, status, sim, onSimChange }: MatchStatusBarProps) {
  const pill = STATUS_PILL[status];
  const PillIcon = pill.icon;

  return (
    <div className="mb-5">
      {/* Kickoff + status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-slate-600">
          <Clock size={15} className="text-slate-400" aria-hidden="true" />
          <time dateTime={match.kickoff} className="font-semibold">
            {match.kickoffLabel}
          </time>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wider ${pill.cls} ${
            status === 'live' ? 'animate-pulse' : ''
          }`}
          aria-label={`Match status: ${pill.label}`}
        >
          <PillIcon size={13} aria-hidden="true" />
          {pill.label}
        </span>
      </div>

      {/* Demo switcher — lets a reviewer experience all lifecycle states.
          The match has actually finished (19 Jul 2026); `Actual` reflects that. */}
      <div className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-slate-200 bg-slate-50/60 p-2">
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Demo state
        </span>
        <div role="group" aria-label="Simulate match state" className="flex flex-1 flex-wrap gap-1">
          {SIM_OPTIONS.map((opt) => {
            const active = sim === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSimChange(opt.id)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}