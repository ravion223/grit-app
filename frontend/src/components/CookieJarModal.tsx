import { useEffect, useMemo, useState } from 'react';
import {
  LuCookie,
  LuFlame,
  LuPencil,
  LuPlus,
  LuShuffle,
  LuX,
} from 'react-icons/lu';
import type { DailyLog, TimeSession } from '../types';
import {
  FOCUS_LEVELS,
  isCallousedMind,
  MOOD_LEVELS,
} from '../utils/accountability';
import {
  formatDayGroupHeader,
  formatDurationHuman,
  getDayKey,
  parseBackendDate,
} from '../utils/time';

interface CookieJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLogs: DailyLog[];
  sessions: TimeSession[];
  onOpenMirrorForDate: (logDate: string) => void;
}

export function CookieJarModal({
  isOpen,
  onClose,
  dailyLogs,
  sessions,
  onOpenMirrorForDate,
}: CookieJarModalProps) {
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cookieLogs = useMemo(
    () =>
      dailyLogs
        .filter((log) => log.is_cookie_jar)
        .sort((a, b) => b.log_date.localeCompare(a.log_date)),
    [dailyLogs],
  );

  // Compute total logged seconds per day across completed sessions
  const daySecondsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sessions) {
      if (s.end_time === null) continue;
      const dKey = getDayKey(parseBackendDate(s.start_time));
      const dur = Math.max(0, s.duration_seconds ?? 0);
      map.set(dKey, (map.get(dKey) ?? 0) + dur);
    }
    return map;
  }, [sessions]);

  if (!isOpen) return null;

  const handleDrawRandomCookie = () => {
    if (cookieLogs.length === 0) return;
    if (cookieLogs.length === 1) {
      setSpotlightIndex(0);
      return;
    }
    let next = Math.floor(Math.random() * cookieLogs.length);
    if (next === spotlightIndex) {
      next = (next + 1) % cookieLogs.length;
    }
    setSpotlightIndex(next);
  };

  const spotlightLog =
    spotlightIndex !== null && cookieLogs[spotlightIndex]
      ? cookieLogs[spotlightIndex]
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-xs sm:p-4">
      <div className="my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#141720] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-[#171a25]/60 px-6 py-4.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <LuCookie className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
                  The Cookie Jar
                </h3>
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  {cookieLogs.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Past victories over resistance · Reach in when you want to quit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cookieLogs.length > 0 && (
              <button
                type="button"
                onClick={handleDrawRandomCookie}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/25 active:scale-[0.98]"
              >
                <LuShuffle className="h-3.5 w-3.5 text-amber-400" />
                <span>Pull a Cookie</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {cookieLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <LuCookie className="h-6 w-6" />
              </div>
              <h4 className="mt-3 text-sm font-semibold text-zinc-200">
                Your Cookie Jar is empty
              </h4>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-400">
                When you push through a brutal day despite low motivation or
                heavy resistance, toggle{' '}
                <strong className="font-semibold text-amber-300">
                  Add to the Cookie Jar
                </strong>{' '}
                in your Accountability Mirror to store that victory here.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMirrorForDate(getDayKey());
                }}
                className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                <LuPlus className="h-3.5 w-3.5" />
                <span>Open Today&apos;s Mirror</span>
              </button>
            </div>
          ) : (
            <>
              {/* Spotlight Drawn Cookie */}
              {spotlightLog && (
                <div className="space-y-2 rounded-2xl border border-amber-500/35 bg-linear-to-br from-amber-500/15 via-amber-500/5 to-transparent p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                      <LuFlame className="h-3.5 w-3.5 text-amber-400" />
                      <span>Drawn from the Jar · Remember What You Did</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSpotlightIndex(null)}
                      className="cursor-pointer text-[11px] text-zinc-400 hover:text-zinc-200"
                    >
                      Dismiss
                    </button>
                  </div>
                  <CookieJarEntryCard
                    log={spotlightLog}
                    loggedSeconds={
                      daySecondsMap.get(spotlightLog.log_date) ?? 0
                    }
                    onEdit={() => {
                      onClose();
                      onOpenMirrorForDate(spotlightLog.log_date);
                    }}
                    highlighted
                  />
                </div>
              )}

              {/* All Cookie Jar Victories */}
              <div className="space-y-3">
                {cookieLogs.map((log) => (
                  <CookieJarEntryCard
                    key={log.id}
                    log={log}
                    loggedSeconds={daySecondsMap.get(log.log_date) ?? 0}
                    onEdit={() => {
                      onClose();
                      onOpenMirrorForDate(log.log_date);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CookieJarEntryCardProps {
  log: DailyLog;
  loggedSeconds: number;
  onEdit: () => void;
  highlighted?: boolean;
}

function CookieJarEntryCard({
  log,
  loggedSeconds,
  onEdit,
  highlighted = false,
}: CookieJarEntryCardProps) {
  const header = formatDayGroupHeader(log.log_date);
  const moodDesc = log.mood_score != null ? MOOD_LEVELS[log.mood_score] : null;
  const focusDesc =
    log.focus_level != null ? FOCUS_LEVELS[log.focus_level] : null;
  const calloused = isCallousedMind(log.mood_score, log.focus_level);

  const MoodIcon = moodDesc?.Icon;
  const FocusIcon = focusDesc?.Icon;

  return (
    <div
      className={`space-y-2.5 rounded-2xl border p-4 transition ${
        highlighted
          ? 'border-amber-500/25 bg-[#161922]/90'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-zinc-100">
            {header.primary}
          </span>
          {header.secondary && (
            <span className="truncate text-[11px] text-zinc-500">
              {header.secondary}
            </span>
          )}
          {loggedSeconds > 0 && (
            <>
              <span className="shrink-0 text-[11px] text-zinc-600">·</span>
              <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                {formatDurationHuman(loggedSeconds)} logged
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onEdit}
          title="Edit Accountability Mirror"
          className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
        >
          <LuPencil className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Rating Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {moodDesc && MoodIcon && (
          <span
            title={`Mood (${log.mood_score}/5): ${moodDesc.subtitle}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: moodDesc.bgColor,
              color: moodDesc.color,
            }}
          >
            <MoodIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{moodDesc.label}</span>
          </span>
        )}

        {focusDesc && FocusIcon && (
          <span
            title={`Focus (${log.focus_level}/5): ${focusDesc.subtitle}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-medium"
            style={{
              backgroundColor: focusDesc.bgColor,
              color: focusDesc.color,
            }}
          >
            <FocusIcon className="h-3.5 w-3.5 shrink-0" />
            <span>{focusDesc.label}</span>
          </span>
        )}

        {calloused && (
          <span
            title="Calloused Mind: Executed despite heavy resistance"
            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300"
          >
            <LuFlame className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span>Calloused Mind</span>
          </span>
        )}
      </div>

      {/* Journal Entry */}
      {log.journal_entry ? (
        <p className="whitespace-pre-line rounded-xl border border-white/[0.04] bg-black/25 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-200">
          {log.journal_entry}
        </p>
      ) : (
        <p className="text-[11px] italic text-zinc-500">
          No written journal note for this day.
        </p>
      )}
    </div>
  );
}
