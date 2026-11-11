import { useState } from 'react';
import {
  LuArchive,
  LuCheck,
  LuPencil,
  LuPlay,
  LuSquare,
  LuTimer,
} from 'react-icons/lu';
import type { Category, CategoryProgress } from '../types';
import { formatDurationHuman, formatStopwatch } from '../utils/time';
import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: Category;
  progress: CategoryProgress | undefined;
  isActive: boolean;
  isAnySessionRunning: boolean;
  activeElapsedSeconds: number;
  onStartOrSwitch: (categoryId: number) => Promise<void>;
  onStop: () => Promise<void>;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
}

export function CategoryCard({
  category,
  progress,
  isActive,
  activeElapsedSeconds,
  onStartOrSwitch,
  onStop,
  onEdit,
  onArchive,
}: CategoryCardProps) {
  const [busy, setBusy] = useState(false);

  const dailySeconds = progress?.dailySeconds ?? 0;
  const dailyTargetSeconds = progress?.dailyTargetSeconds ?? null;
  const dailyPercentage = progress?.dailyPercentage ?? 0;
  const isDailyComplete = progress?.isDailyComplete ?? false;

  const weeklySeconds = progress?.weeklySeconds ?? 0;
  const weeklyTargetSeconds = progress?.weeklyTargetSeconds ?? null;
  const weeklyPercentage = progress?.weeklyPercentage ?? 0;

  const handleAction = async () => {
    setBusy(true);
    try {
      if (isActive) {
        await onStop();
      } else {
        await onStartOrSwitch(category.id);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border bg-[#151821] p-5 transition-all duration-200 hover:bg-[#191d28]"
      style={{
        borderColor: isActive
          ? `${category.color}66`
          : 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Top Section: Icon, Actions, and Full-Width Category Title */}
      <div>
        {/* Row 1: Icon on left, Actions & Play/Stop on right */}
        <div className="flex items-center justify-between">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            <CategoryIcon iconKey={category.icon} className="h-5 w-5" />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <div className="flex items-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => onEdit(category)}
                title="Edit"
                className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
              >
                <LuPencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onArchive(category)}
                title="Archive"
                className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400"
              >
                <LuArchive className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={handleAction}
              title={isActive ? 'Stop' : `Focus on ${category.name}`}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition active:scale-95 disabled:opacity-50"
              style={{
                backgroundColor: isActive
                  ? 'rgba(244, 63, 94, 0.16)'
                  : `${category.color}22`,
                color: isActive ? '#fb7185' : category.color,
              }}
            >
              {isActive ? (
                <LuSquare className="h-3.5 w-3.5 fill-current" />
              ) : (
                <LuPlay className="h-3.5 w-3.5 translate-x-[0.5px] fill-current" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Full-Width Category Name & Active Timer */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <h3
              className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100"
              title={category.name}
            >
              {category.name}
            </h3>
            {isDailyComplete && (
              <span
                title="Daily goal reached"
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
              >
                <LuCheck className="h-2.5 w-2.5" />
              </span>
            )}
          </div>

          {isActive && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: category.color }}
            >
              <LuTimer className="h-3 w-3" />
              {formatStopwatch(activeElapsedSeconds, false)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bars: Today & Week */}
      <div className="mt-5 space-y-3">
        {/* Daily */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Today</span>
            <span className="text-zinc-400">
              {formatDurationHuman(dailySeconds)}
              {dailyTargetSeconds
                ? ` / ${formatDurationHuman(dailyTargetSeconds)}`
                : ''}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  dailyTargetSeconds
                    ? Math.max(dailySeconds > 0 ? 4 : 0, dailyPercentage)
                    : dailySeconds > 0
                      ? 100
                      : 0
                }%`,
                backgroundColor: category.color,
                opacity: dailyTargetSeconds ? 1 : 0.4,
              }}
            />
          </div>
        </div>

        {/* Weekly */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Week</span>
            <span className="text-zinc-400">
              {formatDurationHuman(weeklySeconds)}
              {weeklyTargetSeconds
                ? ` / ${formatDurationHuman(weeklyTargetSeconds)}`
                : ''}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  weeklyTargetSeconds
                    ? Math.max(weeklySeconds > 0 ? 4 : 0, weeklyPercentage)
                    : weeklySeconds > 0
                      ? 100
                      : 0
                }%`,
                backgroundColor: category.color,
                opacity: weeklyTargetSeconds ? 0.7 : 0.3,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
