import { LuCheck, LuPlus } from 'react-icons/lu';
import type { GlobalProgress } from '../types';
import { formatDurationHuman } from '../utils/time';

interface HeaderProgressProps {
  globalProgress: GlobalProgress;
  onNewCategory: () => void;
}

export function HeaderProgress({
  globalProgress,
  onNewCategory,
}: HeaderProgressProps) {
  const todayLabel = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const {
    dailyLoggedSeconds,
    dailyTargetSeconds,
    dailyPercentage,
    weeklyLoggedSeconds,
    weeklyTargetSeconds,
    weeklyPercentage,
  } = globalProgress;

  const isDailyGoalMet =
    dailyTargetSeconds > 0 && dailyLoggedSeconds >= dailyTargetSeconds;
  const isWeeklyGoalMet =
    weeklyTargetSeconds > 0 && weeklyLoggedSeconds >= weeklyTargetSeconds;

  return (
    <header className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
            grit
          </h1>
          <p className="text-xs text-zinc-500">{todayLabel}</p>
        </div>

        <button
          type="button"
          onClick={onNewCategory}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.1] active:scale-[0.98]"
        >
          <LuPlus className="h-3.5 w-3.5 text-zinc-400" />
          <span>New category</span>
        </button>
      </div>

      {/* Chill Daily & Weekly Progress Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Today */}
        <div className="rounded-2xl border border-white/[0.05] bg-[#151821] p-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400">Today</span>
              {isDailyGoalMet && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <LuCheck className="h-3 w-3" /> Done
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400">
              <span className="text-sm font-semibold text-zinc-100">
                {formatDurationHuman(dailyLoggedSeconds)}
              </span>
              {dailyTargetSeconds > 0 && (
                <span className="text-zinc-500">
                  {' '}
                  / {formatDurationHuman(dailyTargetSeconds)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  dailyTargetSeconds > 0
                    ? Math.max(dailyLoggedSeconds > 0 ? 3 : 0, dailyPercentage)
                    : dailyLoggedSeconds > 0
                      ? 100
                      : 0
                }%`,
                backgroundColor: isDailyGoalMet ? '#34d399' : '#6366f1',
              }}
            />
          </div>
        </div>

        {/* This Week */}
        <div className="rounded-2xl border border-white/[0.05] bg-[#151821] p-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-400">
                This week
              </span>
              {isWeeklyGoalMet && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <LuCheck className="h-3 w-3" /> Done
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-400">
              <span className="text-sm font-semibold text-zinc-100">
                {formatDurationHuman(weeklyLoggedSeconds)}
              </span>
              {weeklyTargetSeconds > 0 && (
                <span className="text-zinc-500">
                  {' '}
                  / {formatDurationHuman(weeklyTargetSeconds)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  weeklyTargetSeconds > 0
                    ? Math.max(
                        weeklyLoggedSeconds > 0 ? 3 : 0,
                        weeklyPercentage,
                      )
                    : weeklyLoggedSeconds > 0
                      ? 100
                      : 0
                }%`,
                backgroundColor: '#10b981',
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
