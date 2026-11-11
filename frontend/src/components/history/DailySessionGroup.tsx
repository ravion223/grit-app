import { useState } from 'react';
import { LuChevronDown, LuFlame } from 'react-icons/lu';
import type { Category, SessionUpdate, TimeSession } from '../../types';
import { formatDayGroupHeader, formatDurationHuman } from '../../utils/time';
import { CategoryIcon } from '../CategoryIcon';
import { SessionRow } from '../SessionRow';
import { DailyMirrorSummary } from './DailyMirrorSummary';
import type { DailyGroup } from './types';

interface DailySessionGroupProps {
  group: DailyGroup;
  categoryMap: Map<number, Category>;
  onUpdateSession: (id: number, data: SessionUpdate) => Promise<TimeSession>;
  onDeleteSession: (id: number) => Promise<void>;
  onOpenShutdown: (dayKey: string) => void;
}

const MAX_INLINE_CATEGORIES = 3;

export function DailySessionGroup({
  group,
  categoryMap,
  onUpdateSession,
  onDeleteSession,
  onOpenShutdown,
}: DailySessionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const header = formatDayGroupHeader(group.dayKey);
  const { dailyLog } = group;

  const visibleCategories = group.perCategoryTotals.slice(
    0,
    MAX_INLINE_CATEGORIES,
  );
  const hiddenCount = Math.max(
    0,
    group.perCategoryTotals.length - MAX_INLINE_CATEGORIES,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-[#151821]">
      {/* Day Header */}
      <div className="border-b border-white/[0.05] bg-white/[0.02]">
        <div className="flex flex-col justify-between gap-2.5 px-4 py-2.5 sm:flex-row sm:items-center">
          {/* Left: Day Title, Date & Subtle Mirror Trigger (when unlogged) */}
          <div
            className="flex min-w-0 items-center gap-2"
            title={`${header.primary}${header.secondary ? ` · ${header.secondary}` : ''} (${group.dayKey})`}
          >
            <span className="truncate text-xs font-semibold text-zinc-200">
              {header.primary}
            </span>
            {header.secondary && (
              <span className="truncate text-[11px] font-normal text-zinc-500">
                {header.secondary}
              </span>
            )}
            <span className="shrink-0 text-[11px] text-zinc-600">·</span>
            <span className="shrink-0 text-[11px] font-normal text-zinc-500">
              {group.sessions.length}{' '}
              {group.sessions.length === 1 ? 'session' : 'sessions'}
            </span>

            {!dailyLog && (
              <button
                type="button"
                onClick={() => onOpenShutdown(group.dayKey)}
                title="Log Accountability Mirror for this day"
                className="ml-0.5 inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-indigo-500/15 hover:text-indigo-300"
              >
                <LuFlame className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right: Top 2-3 Category Icon Chips + "+N more" Toggle + Day Total */}
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleCategories.map((catTot) => (
                <div
                  key={String(catTot.key)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] py-1 pr-2 pl-1 text-[11px]"
                  title={`${catTot.name}: ${formatDurationHuman(catTot.seconds)}`}
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                    style={{
                      backgroundColor: `${catTot.color}22`,
                      color: catTot.color,
                    }}
                  >
                    <CategoryIcon
                      iconKey={catTot.icon}
                      className="h-2.5 w-2.5"
                    />
                  </span>
                  <span className="max-w-[85px] truncate text-zinc-400">
                    {catTot.name}
                  </span>
                  <span className="font-medium text-zinc-200">
                    {formatDurationHuman(catTot.seconds)}
                  </span>
                </div>
              ))}

              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/[0.05] px-2 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.1] hover:text-zinc-100"
                >
                  <span>
                    {isExpanded ? 'Show less' : `+${hiddenCount} more`}
                  </span>
                  <LuChevronDown
                    className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>

            <span className="hidden h-3.5 w-px bg-white/[0.07] sm:inline-block" />

            <div className="flex items-baseline gap-1">
              <span className="text-[11px] font-normal text-zinc-500">
                Total
              </span>
              <span className="text-xs font-semibold text-zinc-100">
                {formatDurationHuman(group.totalSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Segmented Proportional Color Bar */}
        {group.totalSeconds > 0 && (
          <div className="flex h-1 w-full overflow-hidden bg-white/[0.03]">
            {group.perCategoryTotals
              .filter((c) => c.seconds > 0)
              .map((catTot) => {
                const pct = (catTot.seconds / group.totalSeconds) * 100;
                return (
                  <div
                    key={String(catTot.key)}
                    title={`${catTot.name}: ${formatDurationHuman(catTot.seconds)} (${Math.round(pct)}%)`}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.max(1.5, pct)}%`,
                      backgroundColor: catTot.color,
                      opacity: 0.85,
                    }}
                  />
                );
              })}
          </div>
        )}
      </div>

      {/* Daily Accountability Mirror Summary */}
      {dailyLog && (
        <DailyMirrorSummary
          dailyLog={dailyLog}
          onEdit={() => onOpenShutdown(group.dayKey)}
        />
      )}

      {/* Expandable Full Daily Category Breakdown (when +N more is toggled) */}
      {isExpanded && (
        <div className="border-b border-white/[0.05] bg-white/[0.015] px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400">
              All categories logged ({group.perCategoryTotals.length})
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="cursor-pointer text-[11px] font-normal text-zinc-500 hover:text-zinc-300"
            >
              Collapse
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.perCategoryTotals.map((catTot) => {
              const pct =
                group.totalSeconds > 0
                  ? Math.round((catTot.seconds / group.totalSeconds) * 100)
                  : 0;
              return (
                <div
                  key={String(catTot.key)}
                  className="flex flex-col gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: `${catTot.color}20`,
                          color: catTot.color,
                        }}
                      >
                        <CategoryIcon
                          iconKey={catTot.icon}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      <span className="truncate text-xs font-medium text-zinc-200">
                        {catTot.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-1.5">
                      <span className="text-xs font-semibold text-zinc-100">
                        {formatDurationHuman(catTot.seconds)}
                      </span>
                      <span className="text-[10px] font-normal text-zinc-500">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(3, pct)}%`,
                        backgroundColor: catTot.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day's Chronological Sessions */}
      {group.sessions.length > 0 && (
        <div className="divide-y divide-white/[0.04] p-2">
          {group.sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              category={categoryMap.get(session.category_id)}
              compactDate={true}
              onUpdate={onUpdateSession}
              onDelete={onDeleteSession}
            />
          ))}
        </div>
      )}
    </div>
  );
}
