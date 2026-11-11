import { LuCookie, LuFlame, LuPencil } from 'react-icons/lu';
import type { DailyLog } from '../../types';
import {
  FOCUS_LEVELS,
  isCallousedMind,
  MOOD_LEVELS,
} from '../../utils/accountability';

interface DailyMirrorSummaryProps {
  dailyLog: DailyLog;
  onEdit: () => void;
}

export function DailyMirrorSummary({
  dailyLog,
  onEdit,
}: DailyMirrorSummaryProps) {
  const moodDesc =
    dailyLog.mood_score != null ? MOOD_LEVELS[dailyLog.mood_score] : null;
  const focusDesc =
    dailyLog.focus_level != null ? FOCUS_LEVELS[dailyLog.focus_level] : null;
  const calloused = isCallousedMind(dailyLog.mood_score, dailyLog.focus_level);

  const MoodIcon = moodDesc?.Icon;
  const FocusIcon = focusDesc?.Icon;

  return (
    <div className="space-y-2 border-b border-white/[0.04] bg-white/[0.01] px-4 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {moodDesc && MoodIcon && (
            <span
              title={`Mood (${dailyLog.mood_score}/5): ${moodDesc.subtitle}`}
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
              title={`Focus (${dailyLog.focus_level}/5): ${focusDesc.subtitle}`}
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
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300"
            >
              <LuFlame className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>Calloused Mind</span>
            </span>
          )}

          {dailyLog.is_cookie_jar && (
            <span
              title="Saved in the Cookie Jar"
              className="inline-flex h-5.5 w-5.5 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/15 text-amber-400"
            >
              <LuCookie className="h-3.5 w-3.5" />
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onEdit}
          title="Edit Accountability Mirror"
          className="cursor-pointer rounded-lg p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          <LuPencil className="h-3 w-3" />
        </button>
      </div>

      {dailyLog.journal_entry && (
        <p className="whitespace-pre-line text-xs leading-relaxed text-zinc-400">
          {dailyLog.journal_entry}
        </p>
      )}
    </div>
  );
}
