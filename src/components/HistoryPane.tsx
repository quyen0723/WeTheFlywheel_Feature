import { TrendingUp } from 'lucide-react';
import type { DuelScore, MatchConfig, MatchStatus, Score } from '../lib/types';
import { tendencyOf } from '../lib/badge';

interface HistoryPaneProps {
  match: MatchConfig;
  pick: Score;
  hasPick: boolean;
  status: MatchStatus;
  duel: DuelScore | null;
}

/** Status cell content for the settled/unfinished row. */
function statusCell(hasPick: boolean, status: MatchStatus, duel: DuelScore | null) {
  if (!hasPick) return { label: 'No tip', cls: 'text-slate-400' };
  if (status !== 'ended') return { label: 'Pending', cls: 'text-brand-amber-dark' };
  if (duel?.exact) return { label: 'EXACT ✓', cls: 'text-brand-green' };
  if (duel?.tend) return { label: 'TEND ✓', cls: 'text-brand-blue' };
  return { label: 'Miss', cls: 'text-brand-red' };
}

export function HistoryPane({ match, pick, hasPick, status, duel }: HistoryPaneProps) {
  const settled = status === 'ended' && match.realResult;
  const real = match.realResult;
  const realTend = real ? tendencyOf(real) : null;
  const winnerCode = realTend === 'home' ? match.home.code : realTend === 'away' ? match.away.code : 'Draw';

  const st = statusCell(hasPick, status, duel);

  return (
    <div className="flex flex-col items-center justify-center text-slate-400">
      <TrendingUp size={48} className="mb-4 opacity-50" aria-hidden="true" />
      <h2 className="mb-1 text-[19px] font-bold text-slate-700">Prediction History</h2>
      <p className="mb-6 text-[14px]">Your tipped matches and how they settled.</p>

      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold">Match</th>
              <th scope="col" className="px-3 py-2 font-bold">Your tip</th>
              <th scope="col" className="px-3 py-2 font-bold">Actual</th>
              <th scope="col" className="px-3 py-2 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-3">
                <div className="font-semibold text-slate-700">
                  {match.home.code} vs {match.away.code}
                </div>
                <div className="text-[11px] text-slate-400">{match.kickoffLabel}</div>
              </td>
              <td className="px-3 py-3 font-semibold text-slate-700">
                {hasPick ? (
                  <span>
                    {pick.home}–{pick.away}
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
              <td className="px-3 py-3 font-semibold text-slate-700">
                {settled && real ? (
                  <span>
                    {real.home}–{real.away} <span className="text-slate-400">({winnerCode})</span>
                  </span>
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
              <td className={`px-3 py-3 font-bold ${st.cls}`}>{st.label}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 max-w-lg text-center text-[12px] text-slate-400">
        EXACT ✓ = called the exact scoreline · TEND ✓ = called the tendency · Miss = neither.
      </p>
    </div>
  );
}