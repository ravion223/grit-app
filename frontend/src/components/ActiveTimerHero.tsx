import { useState } from 'react';
import { LuPlay, LuSquare } from 'react-icons/lu';
import type { Category, CategoryProgress, TimeSession } from '../types';
import { formatDurationHuman, formatStopwatch } from '../utils/time';
import { CategoryIcon } from './CategoryIcon';

interface ActiveTimerHeroProps {
  activeSession: TimeSession | null;
  activeCategory: Category | undefined;
  categories: Category[];
  elapsedSeconds: number;
  activeCategoryProgress: CategoryProgress | undefined;
  onStartCategory: (categoryId: number) => Promise<void>;
  onStopSession: (optionalNote?: string) => Promise<void>;
}

export function ActiveTimerHero({
  activeSession,
  activeCategory,
  categories,
  elapsedSeconds,
  activeCategoryProgress,
  onStartCategory,
  onStopSession,
}: ActiveTimerHeroProps) {
  const [sessionNote, setSessionNote] = useState('');
  const [busy, setBusy] = useState(false);

  const handleStop = async () => {
    setBusy(true);
    try {
      await onStopSession(sessionNote);
      setSessionNote('');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickStart = async (categoryId: number) => {
    setBusy(true);
    try {
      await onStartCategory(categoryId);
    } finally {
      setBusy(false);
    }
  };

  const accentColor = activeCategory?.color || '#10B981';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#151821] px-6 py-8 sm:px-8">
      {/* Horizon Rim Light + Wide Elliptical Beam (zero GPU blur overhead) */}
      {activeSession && (
        <>
          {/* Wide elliptical light wash cast downward from the top center (50% 0%) */}
          <div
            className="pointer-events-none absolute inset-0 transform-gpu transition-opacity duration-700"
            style={{
              background: [
                `radial-gradient(32% 48% at 50% 0%, ${accentColor}24 0%, transparent 100%)`,
                `radial-gradient(68% 90% at 50% 0%, ${accentColor}22 0%, ${accentColor}10 38%, ${accentColor}04 68%, transparent 100%)`,
              ].join(', '),
            }}
          />

          {/* 1px colored horizon rim along the top border */}
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px transform-gpu transition-all duration-700"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accentColor}55 25%, ${accentColor}d9 50%, ${accentColor}55 75%, transparent 100%)`,
            }}
          />

          {/* Subtle specular center highlight on the rim */}
          <div
            className="pointer-events-none absolute top-0 left-1/2 h-px w-48 -translate-x-1/2 transform-gpu"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
            }}
          />
        </>
      )}

      <div className="relative flex flex-col items-center text-center">
        {/* Category Pill or Idle Hint */}
        {activeSession && activeCategory ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-zinc-200">
            <span
              className="animate-pulse-subtle h-2 w-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <CategoryIcon
              iconKey={activeCategory.icon}
              className="h-3.5 w-3.5 text-zinc-300"
            />
            <span>{activeCategory.name}</span>
            {activeCategoryProgress?.dailyTargetSeconds ? (
              <span className="text-zinc-500">
                • {formatDurationHuman(activeCategoryProgress.dailySeconds)} /{' '}
                {formatDurationHuman(activeCategoryProgress.dailyTargetSeconds)}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="text-xs font-medium text-zinc-500">
            Ready when you are
          </span>
        )}

        {/* Main Timer Readout — Smooth, Chill Sans-Serif */}
        <div className="my-4 text-6xl font-medium tracking-tight text-zinc-100 sm:text-7xl">
          {formatStopwatch(elapsedSeconds, false)}
        </div>

        {/* Controls / Note Input */}
        {activeSession ? (
          <div className="mt-2 flex w-full max-w-md flex-col items-center gap-4">
            {activeCategoryProgress?.dailyTargetSeconds ? (
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      3,
                      activeCategoryProgress.dailyPercentage,
                    )}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
            ) : null}

            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder="Add a quick note..."
                maxLength={500}
                className="w-full rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-white/[0.15] focus:bg-white/[0.05] focus:outline-none"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleStop}
                className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-rose-500/90 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50"
              >
                <LuSquare className="h-3 w-3 fill-current" />
                <span>Stop</span>
              </button>
            </div>
          </div>
        ) : (
          categories.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={busy}
                  onClick={() => handleQuickStart(cat.id)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  <LuPlay className="h-2.5 w-2.5 fill-current text-zinc-500" />
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
