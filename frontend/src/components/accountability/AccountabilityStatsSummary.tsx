import { LuCheck } from 'react-icons/lu';
import { formatDurationHuman } from '../../utils/time';

interface AccountabilityStatsSummaryProps {
  totalSeconds: number;
  targetSeconds: number;
  percentage: number;
  sessionCount: number;
  isGoalMet: boolean;
}

export function AccountabilityStatsSummary({
  totalSeconds,
  targetSeconds,
  percentage,
  sessionCount,
  isGoalMet,
}: AccountabilityStatsSummaryProps) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-[#161a24] p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Execution Report
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-zinc-100">
              {formatDurationHuman(totalSeconds)}
            </span>
            {targetSeconds > 0 && (
              <span className="text-xs text-zinc-500">
                / {formatDurationHuman(targetSeconds)} target
              </span>
            )}
          </div>
        </div>

        {targetSeconds > 0 && (
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isGoalMet
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-indigo-500/15 text-indigo-300'
              }`}
            >
              {isGoalMet && <LuCheck className="h-3 w-3" />}
              {percentage}%
            </span>
            <p className="mt-1 text-[11px] text-zinc-500">
              {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
            </p>
          </div>
        )}
      </div>

      {/* Target Progress Bar */}
      {targetSeconds > 0 && (
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(totalSeconds > 0 ? 3 : 0, percentage)}%`,
              backgroundColor: isGoalMet ? '#34d399' : '#6366f1',
            }}
          />
        </div>
      )}
    </div>
  );
}
