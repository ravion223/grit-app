import { useState } from 'react';
import { LuCheck, LuPencil, LuTrash2, LuX } from 'react-icons/lu';
import type { Category, SessionUpdate, TimeSession } from '../types';
import {
  formatDurationHuman,
  formatSessionTimeRange,
  formatSessionTimestamp,
} from '../utils/time';
import { CategoryIcon } from './CategoryIcon';

interface SessionRowProps {
  session: TimeSession;
  category: Category | undefined;
  compactDate?: boolean;
  onUpdate: (id: number, data: SessionUpdate) => Promise<TimeSession>;
  onDelete: (id: number) => Promise<void>;
}

export function SessionRow({
  session,
  category,
  compactDate = false,
  onUpdate,
  onDelete,
}: SessionRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMinutes, setEditMinutes] = useState(() =>
    String(Math.floor((session.duration_seconds ?? 0) / 60)),
  );
  const [editSeconds, setEditSeconds] = useState(() =>
    String((session.duration_seconds ?? 0) % 60),
  );
  const [editNote, setEditNote] = useState(session.note ?? '');
  const [busy, setBusy] = useState(false);

  const color = category?.color ?? '#71717a';
  const durationSeconds = session.duration_seconds ?? 0;

  const startEditing = () => {
    setEditMinutes(String(Math.floor(durationSeconds / 60)));
    setEditSeconds(String(durationSeconds % 60));
    setEditNote(session.note ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const mins = Math.max(0, parseInt(editMinutes || '0', 10) || 0);
    const secs = Math.max(0, parseInt(editSeconds || '0', 10) || 0);
    const totalSeconds = mins * 60 + secs;

    setBusy(true);
    try {
      await onUpdate(session.id, {
        duration_seconds: totalSeconds,
        note: editNote.trim() || null,
      });
      setIsEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete(session.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-xl px-3.5 py-2.5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center">
      {/* Left: Category Badge, Timestamp & Note */}
      <div className="flex items-start gap-3 sm:items-center">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:mt-0"
          style={{
            backgroundColor: `${color}20`,
            color,
          }}
        >
          <CategoryIcon iconKey={category?.icon} className="h-4 w-4" />
        </div>

        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-200">
              {category?.name ?? 'Archived'}
            </span>
            <span className="text-[11px] text-zinc-600">•</span>
            <span className="text-[11px] font-normal text-zinc-500">
              {compactDate
                ? formatSessionTimeRange(session.start_time, session.end_time)
                : formatSessionTimestamp(session.start_time)}
            </span>
          </div>

          {!isEditing && session.note && (
            <p className="text-xs text-zinc-400">{session.note}</p>
          )}
        </div>
      </div>

      {/* Right: Duration or Inline Edit Form */}
      {isEditing ? (
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <input
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Note..."
            maxLength={500}
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-200 focus:border-white/[0.2] focus:outline-none sm:w-44"
          />

          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs">
            <input
              type="number"
              min={0}
              value={editMinutes}
              onChange={(e) => setEditMinutes(e.target.value)}
              className="w-10 text-xs font-normal text-zinc-100 focus:outline-none"
              title="Minutes"
            />
            <span className="text-zinc-500">m</span>
            <input
              type="number"
              min={0}
              max={59}
              value={editSeconds}
              onChange={(e) => setEditSeconds(e.target.value)}
              className="w-9 text-xs font-normal text-zinc-100 focus:outline-none"
              title="Seconds"
            />
            <span className="text-zinc-500">s</span>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            title="Save"
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            <LuCheck className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setIsEditing(false)}
            title="Cancel"
            className="cursor-pointer rounded-lg p-1 text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
          >
            <LuX className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="text-xs font-medium text-zinc-300">
            {formatDurationHuman(durationSeconds)}
          </span>

          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              disabled={busy}
              onClick={startEditing}
              title="Edit"
              className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            >
              <LuPencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              title="Delete"
              className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LuTrash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
