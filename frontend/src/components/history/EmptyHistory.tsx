import type { CategoryFilterValue } from './types';

interface EmptyHistoryProps {
  selectedMonth: string;
  activeFilter: CategoryFilterValue;
  activeFilterLabel: string;
  latestActiveMonth: string | null;
  onSelectCategory: (value: CategoryFilterValue) => void;
  onSelectMonth: (monthKey: string) => void;
}

export function EmptyHistory({
  selectedMonth,
  activeFilter,
  activeFilterLabel,
  latestActiveMonth,
  onSelectCategory,
  onSelectMonth,
}: EmptyHistoryProps) {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-[#151821] px-4 py-10 text-center">
      <p className="text-xs font-medium text-zinc-300">
        No sessions recorded for{' '}
        <span className="font-medium text-zinc-100">{selectedMonth}</span>
        {activeFilter !== 'all' ? ` in ${activeFilterLabel}` : ''}
      </p>
      <p className="mt-1 text-xs text-zinc-500 font-normal">
        Start a focus session or switch the month / category filter above.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {activeFilter !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="cursor-pointer rounded-full bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.12]"
          >
            Show all categories in {selectedMonth}
          </button>
        )}
        {latestActiveMonth && latestActiveMonth !== selectedMonth && (
          <button
            type="button"
            onClick={() => {
              onSelectMonth(latestActiveMonth);
              onSelectCategory('all');
            }}
            className="cursor-pointer rounded-full bg-emerald-500/15 px-3.5 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25"
          >
            Jump to {latestActiveMonth}
          </button>
        )}
      </div>
    </div>
  );
}
