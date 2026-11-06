import { formatDurationHuman, formatMonthShort } from '../../utils/time';
import { CategoryIcon } from '../CategoryIcon';
import type {
  CategoryFilterValue,
  CategoryMonthlySummary,
  FilteredHistoryStats,
} from './types';

interface MonthlyAggregatesProps {
  selectedMonth: string;
  activeFilter: CategoryFilterValue;
  activeFilterLabel: string;
  filteredStats: FilteredHistoryStats;
  monthTotalSeconds: number;
  elapsedDaysInMonth: number;
  categorySummaries: CategoryMonthlySummary[];
  onSelectCategory: (value: CategoryFilterValue) => void;
}

export function MonthlyAggregates({
  selectedMonth,
  activeFilter,
  activeFilterLabel,
  filteredStats,
  monthTotalSeconds,
  elapsedDaysInMonth,
  categorySummaries,
  onSelectCategory,
}: MonthlyAggregatesProps) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-[#151821] p-4 sm:p-5">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Card 1: Monthly Total */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-medium text-zinc-500">
              Monthly Total
            </span>
            <span className="shrink-0 text-[11px] font-normal text-zinc-500">
              {activeFilter === 'all'
                ? formatMonthShort(selectedMonth)
                : activeFilterLabel}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-lg font-semibold text-zinc-100">
              {formatDurationHuman(filteredStats.totalSeconds)}
            </span>
            <span className="text-xs font-normal text-zinc-400">
              {filteredStats.sessionCount} session
              {filteredStats.sessionCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Card 2: Daily Avg (Active Days) */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-medium text-zinc-500">
              Daily Avg (Active)
            </span>
            <span className="shrink-0 text-[11px] font-normal text-zinc-500">
              {filteredStats.activeDaysCount} active{' '}
              {filteredStats.activeDaysCount === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-lg font-semibold text-zinc-100">
              {formatDurationHuman(filteredStats.avgPerActiveDay)}
            </span>
            <span className="text-xs font-normal text-zinc-400">
              per active day
            </span>
          </div>
        </div>

        {/* Card 3: Daily Avg (Calendar Days) */}
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[11px] font-medium text-zinc-500">
              Daily Avg (Calendar)
            </span>
            <span className="shrink-0 text-[11px] font-normal text-zinc-500">
              {elapsedDaysInMonth} calendar{' '}
              {elapsedDaysInMonth === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-lg font-semibold text-zinc-100">
              {formatDurationHuman(filteredStats.avgPerCalendarDay)}
            </span>
            <span className="text-xs font-normal text-zinc-400">
              per calendar day
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Category Stacked Distribution Bar & Per-Category Breakdown */}
      {categorySummaries.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-white/[0.05] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-zinc-400">
              Category Breakdown (Monthly &amp; Daily Totals)
            </h3>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="cursor-pointer text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
              >
                Show all categories
              </button>
            )}
          </div>

          {/* Stacked Proportional Bar */}
          {monthTotalSeconds > 0 && (
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
              {categorySummaries
                .filter((c) => c.totalSeconds > 0)
                .map((c) => (
                  <div
                    key={String(c.categoryId)}
                    title={`${c.name}: ${formatDurationHuman(c.totalSeconds)} (${Math.round(c.percentageOfMonth)}%)`}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.max(2, c.percentageOfMonth)}%`,
                      backgroundColor: c.color,
                      opacity:
                        activeFilter === 'all' || activeFilter === c.categoryId
                          ? 1
                          : 0.25,
                    }}
                  />
                ))}
            </div>
          )}

          {/* Per-Category Aggregated Rows */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categorySummaries.map((cat) => {
              const isSelected = activeFilter === cat.categoryId;
              const pct = Math.round(cat.percentageOfMonth);
              return (
                <button
                  key={String(cat.categoryId)}
                  type="button"
                  onClick={() =>
                    onSelectCategory(isSelected ? 'all' : cat.categoryId)
                  }
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'bg-white/[0.06]'
                      : 'border-white/[0.04] bg-white/[0.015] hover:border-white/[0.09] hover:bg-white/[0.04]'
                  }`}
                  style={
                    isSelected ? { borderColor: `${cat.color}66` } : undefined
                  }
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon iconKey={cat.icon} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-medium text-zinc-200">
                          {cat.name}
                        </span>
                        {monthTotalSeconds > 0 && cat.totalSeconds > 0 && (
                          <span className="text-[10px] text-zinc-500 font-normal">
                            {pct}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 font-normal">
                        {cat.activeDaysCount > 0 ? (
                          <>
                            {formatDurationHuman(cat.avgPerActiveDaySeconds)}
                            /active day · {cat.activeDaysCount}d ·{' '}
                            {cat.sessionCount} sess
                          </>
                        ) : (
                          'No sessions this month'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-zinc-100">
                      {formatDurationHuman(cat.totalSeconds)}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-normal">
                      {formatDurationHuman(cat.avgPerCalendarDaySeconds)}/day
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
