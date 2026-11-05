import { useEffect, useMemo, useRef, useState } from 'react';
import { LuCheck, LuChevronDown, LuSlidersHorizontal } from 'react-icons/lu';
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories],
  );

  const allCompletedSessions = useMemo(
    () => sessions.filter((s) => s.end_time !== null),
    [sessions],
  );

  // Count completed sessions per category and only show categories that have sessions
  const { categoriesWithSessions, sessionCountByCat } = useMemo(() => {
    const counts = new Map<number, number>();
    for (const s of allCompletedSessions) {
      counts.set(s.category_id, (counts.get(s.category_id) ?? 0) + 1);
    }
    const activeCats = categories.filter(
      (cat) => (counts.get(cat.id) ?? 0) > 0,
    );
    return { categoriesWithSessions: activeCats, sessionCountByCat: counts };
  }, [allCompletedSessions, categories]);

  // Automatically fall back to "All" if the selected category no longer has any sessions
  const activeCategoryId =
    selectedCategoryId !== null && sessionCountByCat.has(selectedCategoryId)
      ? selectedCategoryId
      : null;

  const selectedCategory =
    activeCategoryId !== null ? categoryMap.get(activeCategoryId) : undefined;

  const filteredSessions = useMemo(
    () =>
      activeCategoryId === null
        ? allCompletedSessions
        : allCompletedSessions.filter(
            (s) => s.category_id === activeCategoryId,
          ),
    [allCompletedSessions, activeCategoryId],
  );

  return (
    <section className="space-y-3">
      {/* Header & Custom Category Dropdown */}
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-medium text-zinc-400">Recent sessions</h2>

        {categoriesWithSessions.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.07] bg-[#151821] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-white/[0.14] hover:bg-[#191d28]"
            >
              {selectedCategory ? (
                <>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  <span className="max-w-[140px] truncate">
                    {selectedCategory.name}
                  </span>
                  <span className="text-zinc-500 tabular-nums">
                    ({sessionCountByCat.get(selectedCategory.id) ?? 0})
                  </span>
                </>
              ) : (
                <>
                  <LuSlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" />
                  <span>All categories</span>
                  <span className="text-zinc-500 tabular-nums">
                    ({allCompletedSessions.length})
                  </span>
                </>
              )}
              <LuChevronDown
                className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-zinc-300' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-2xl border border-white/[0.08] bg-[#181b26] p-1.5 shadow-2xl">
                <div className="max-h-60 space-y-0.5 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(null);
                      setIsOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                      activeCategoryId === null
                        ? 'bg-white/[0.08] text-zinc-100'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LuSlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
                      <span>All categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] tabular-nums text-zinc-500">
                        {allCompletedSessions.length}
                      </span>
                      {activeCategoryId === null && (
                        <LuCheck className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                  </button>

                  <div className="my-1 border-t border-white/[0.05]" />

                  {categoriesWithSessions.map((cat) => {
                    const isSelected = activeCategoryId === cat.id;
                    const count = sessionCountByCat.get(cat.id) ?? 0;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setIsOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                          isSelected
                            ? 'bg-white/[0.08] text-zinc-100'
                            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-2">
                          <span className="text-[11px] tabular-nums text-zinc-500">
                            {count}
                          </span>
                          {isSelected && (
                            <LuCheck className="h-3.5 w-3.5 text-emerald-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session List */}
      <div className="rounded-2xl border border-white/[0.05] bg-[#151821] p-2">
        {filteredSessions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-zinc-500">No sessions recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filteredSessions.map((session) => (
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
