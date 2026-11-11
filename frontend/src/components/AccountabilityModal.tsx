import { useEffect, useMemo, useState } from 'react';
import { LuCalendar, LuFlame, LuTrash2, LuX } from 'react-icons/lu';
import type { Category, DailyLog, DailyLogUpsert, TimeSession } from '../types';
import {
  FOCUS_LEVELS,
  isCallousedMind,
  JOURNAL_PLACEHOLDERS,
  MOOD_LEVELS,
} from '../utils/accountability';
import { getDayKey, parseBackendDate } from '../utils/time';
import { AccountabilityStatsSummary } from './accountability/AccountabilityStatsSummary';
import { ActiveSessionNotice } from './accountability/ActiveSessionNotice';
import { CallousedMindBanner } from './accountability/CallousedMindBanner';
import { CookieJarToggle } from './accountability/CookieJarToggle';
import { RatingSlider } from './accountability/RatingSlider';

interface AccountabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  sessions: TimeSession[];
  activeSession: TimeSession | null;
  onStopActiveSession?: () => Promise<void>;
  onSaveDailyLog: (logDate: string, data: DailyLogUpsert) => Promise<DailyLog>;
  onDeleteDailyLog?: (logDate: string) => Promise<void>;
  existingLogs?: Map<string, DailyLog>;
  initialDate?: string;
}

export function AccountabilityModal({
  isOpen,
  onClose,
  categories,
  sessions,
  activeSession,
  onStopActiveSession,
  onSaveDailyLog,
  onDeleteDailyLog,
  existingLogs,
  initialDate,
}: AccountabilityModalProps) {
  if (!isOpen) return null;

  return (
    <AccountabilityModalForm
      key={initialDate ?? getDayKey()}
      onClose={onClose}
      categories={categories}
      sessions={sessions}
      activeSession={activeSession}
      onStopActiveSession={onStopActiveSession}
      onSaveDailyLog={onSaveDailyLog}
      onDeleteDailyLog={onDeleteDailyLog}
      existingLogs={existingLogs}
      initialDate={initialDate}
    />
  );
}

function AccountabilityModalForm({
  onClose,
  categories,
  sessions,
  activeSession,
  onStopActiveSession,
  onSaveDailyLog,
  onDeleteDailyLog,
  existingLogs,
  initialDate,
}: Omit<AccountabilityModalProps, 'isOpen'>) {
  const todayKey = useMemo(() => getDayKey(), []);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || todayKey,
  );

  const existingLog = useMemo(
    () => existingLogs?.get(selectedDate),
    [existingLogs, selectedDate],
  );

  const [moodScore, setMoodScore] = useState<number | null>(
    () => existingLog?.mood_score ?? null,
  );
  const [focusLevel, setFocusLevel] = useState<number | null>(
    () => existingLog?.focus_level ?? null,
  );
  const [isCookieJar, setIsCookieJar] = useState<boolean>(
    () => existingLog?.is_cookie_jar ?? false,
  );
  const [journalEntry, setJournalEntry] = useState<string>(
    () => existingLog?.journal_entry ?? '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [stoppingTimer, setStoppingTimer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const log = existingLogs?.get(newDate);
    setMoodScore(log?.mood_score ?? null);
    setFocusLevel(log?.focus_level ?? null);
    setIsCookieJar(log?.is_cookie_jar ?? false);
    setJournalEntry(log?.journal_entry ?? '');
    setErrorMessage(null);
  };

  const handleMoodSelect = (val: number | null) => {
    setMoodScore(val);
    if (isCallousedMind(val, focusLevel)) {
      setIsCookieJar(true);
    }
  };

  const handleFocusSelect = (val: number | null) => {
    setFocusLevel(val);
    if (isCallousedMind(moodScore, val)) {
      setIsCookieJar(true);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Aggregate sessions for the selected day
  const dayStats = useMemo(() => {
    const matchingSessions = sessions.filter((s) => {
      const sDay = getDayKey(parseBackendDate(s.start_time));
      return sDay === selectedDate && s.end_time !== null;
    });

    const totalSeconds = matchingSessions.reduce(
      (sum, s) => sum + Math.max(0, s.duration_seconds ?? 0),
      0,
    );

    const totalTargetMinutes = categories.reduce(
      (sum, c) => sum + (c.daily_target_minutes ?? 0),
      0,
    );
    const targetSeconds = totalTargetMinutes * 60;

    const percentage =
      targetSeconds > 0
        ? Math.min(100, Math.round((totalSeconds / targetSeconds) * 100))
        : 100;

    return {
      sessionCount: matchingSessions.length,
      totalSeconds,
      targetSeconds,
      percentage,
      isGoalMet: targetSeconds > 0 && totalSeconds >= targetSeconds,
    };
  }, [sessions, categories, selectedDate]);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeSession?.category_id),
    [categories, activeSession],
  );

  const calloused = isCallousedMind(moodScore, focusLevel);

  const placeholderPrompt = useMemo(() => {
    const dayNum = selectedDate
      ? selectedDate.split('-').reduce((sum, n) => sum + parseInt(n, 10), 0)
      : 0;
    return JOURNAL_PLACEHOLDERS[dayNum % JOURNAL_PLACEHOLDERS.length];
  }, [selectedDate]);

  const handleStopActiveSession = async () => {
    if (!onStopActiveSession) return;
    setStoppingTimer(true);
    try {
      await onStopActiveSession();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to stop running timer',
      );
    } finally {
      setStoppingTimer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      await onSaveDailyLog(selectedDate, {
        mood_score: moodScore,
        focus_level: focusLevel,
        is_cookie_jar: isCookieJar,
        journal_entry: journalEntry.trim() ? journalEntry.trim() : null,
      });
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save daily log.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteDailyLog || !existingLog) return;
    if (!window.confirm('Delete this day’s accountability entry?')) return;

    setSubmitting(true);
    try {
      await onDeleteDailyLog(selectedDate);
      onClose();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to delete daily log.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-xs sm:p-4">
      <div className="my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#141720] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-[#171a25]/60 px-6 py-4.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <LuFlame className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
                Accountability Mirror
              </h3>
              <p className="text-[11px] text-zinc-400">
                Daily shutdown ritual · Face the numbers &amp; own your day
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto px-6 py-5"
        >
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {/* Date Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <LuCalendar className="h-4 w-4 text-zinc-400" />
              <label
                htmlFor="ritual-date"
                className="text-xs font-medium text-zinc-300"
              >
                Log Date
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="ritual-date"
                type="date"
                max={todayKey}
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
              {selectedDate !== todayKey && (
                <button
                  type="button"
                  onClick={() => handleDateChange(todayKey)}
                  className="cursor-pointer rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200"
                >
                  Jump to Today
                </button>
              )}
            </div>
          </div>

          {/* Active Session Warning / Stop Action */}
          {selectedDate === todayKey && activeSession && (
            <ActiveSessionNotice
              categoryName={activeCategory?.name}
              stopping={stoppingTimer}
              onStop={handleStopActiveSession}
            />
          )}

          {/* Accountability Stats Summary */}
          <AccountabilityStatsSummary
            totalSeconds={dayStats.totalSeconds}
            targetSeconds={dayStats.targetSeconds}
            percentage={dayStats.percentage}
            sessionCount={dayStats.sessionCount}
            isGoalMet={dayStats.isGoalMet}
          />

          {/* 1. Mood / Internal State Slider */}
          <RatingSlider
            title="1. Internal State (How You Felt)"
            subtitle="Resistance, physical fatigue, and urge to quit"
            value={moodScore}
            descriptors={MOOD_LEVELS}
            onChange={handleMoodSelect}
          />

          {/* 2. Focus / Execution Slider */}
          <RatingSlider
            title="2. Execution & Focus (How Hard You Locked In)"
            subtitle="Discipline, overcoming distractions, and honoring the target"
            value={focusLevel}
            descriptors={FOCUS_LEVELS}
            onChange={handleFocusSelect}
          />

          {/* Calloused Mind Banner */}
          {calloused && <CallousedMindBanner />}

          {/* Cookie Jar Toggle */}
          <CookieJarToggle
            isCookieJar={isCookieJar}
            onToggle={() => setIsCookieJar((prev) => !prev)}
          />

          {/* Daily Journal / Reflection Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Daily Journal &amp; Accountability Notes
              </label>
              <span className="font-mono text-[11px] text-zinc-500">
                {journalEntry.length}/2000
              </span>
            </div>

            <textarea
              rows={4}
              maxLength={2000}
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder={placeholderPrompt}
              className="w-full resize-none rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:bg-white/[0.05] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/[0.05] pt-2">
            <div>
              {existingLog && onDeleteDailyLog && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-50"
                >
                  <LuTrash2 className="h-3.5 w-3.5" />
                  <span>Delete log</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-full bg-indigo-500 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-400 disabled:opacity-50"
              >
                {submitting ? 'Shutting down...' : 'Complete Shutdown'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
