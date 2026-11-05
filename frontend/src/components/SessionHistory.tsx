import { useMemo, useState } from 'react';
import type { Category, SessionUpdate, TimeSession } from '../types';
import { SessionRow } from './SessionRow';

interface SessionHistoryProps {
  sessions: TimeSession[];
  categories: Category[];
  onUpdateSession: (id: number, data: SessionUpdate) => Promise<TimeSession>;
  onDeleteSession: (id: number) => Promise<void>;
}

export function SessionHistory({
  sessions,
  categories,
  onUpdateSession,
  onDeleteSession,
}: SessionHistoryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories],
  );

  const completedSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.end_time !== null &&
          (selectedCategoryId === null || s.category_id === selectedCategoryId),
      ),
    [sessions, selectedCategoryId],
  );

  return (
    <section className="space-y-3">
      {/* Header & Category Filter Pills */}
      <div className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-center">
        <h2 className="text-sm font-medium text-zinc-400">Recent sessions</h2>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition ${
                selectedCategoryId === null
                  ? 'bg-white/[0.12] text-zinc-100'
                  : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategoryId(
                    selectedCategoryId === cat.id ? null : cat.id,
                  )
                }
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                  selectedCategoryId === cat.id
                    ? 'bg-white/[0.12] text-zinc-100'
                    : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Session List */}
      <div className="rounded-2xl border border-white/[0.05] bg-[#151821] p-2">
        {completedSessions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-zinc-500">No sessions recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {completedSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                category={categoryMap.get(session.category_id)}
                onUpdate={onUpdateSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
