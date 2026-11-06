import { formatDurationHuman } from '../../utils/time';
import type { CategoryFilterValue, CategoryMonthlySummary } from './types';

interface CategoryFilterTabsProps {
  activeFilter: CategoryFilterValue;
  monthTotalSeconds: number;
  monthSessionsCount: number;
  categorySummaries: CategoryMonthlySummary[];
  onSelectCategory: (value: CategoryFilterValue) => void;
}

export function CategoryFilterTabs({
  activeFilter,
  monthTotalSeconds,
  monthSessionsCount,
  categorySummaries,
  onSelectCategory,
}: CategoryFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Category filter tabs"
      className="flex items-center gap-1.5 overflow-x-auto pb-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeFilter === 'all'}
        onClick={() => onSelectCategory('all')}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
          activeFilter === 'all'
            ? 'border-white/[0.18] bg-white/[0.1] text-zinc-100 shadow-sm'
            : 'border-white/[0.05] bg-[#151821] text-zinc-400 hover:border-white/[0.1] hover:bg-[#191d28] hover:text-zinc-200'
        }`}
      >
        <span>All Categories</span>
        <span className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[11px] font-normal text-zinc-300">
          {formatDurationHuman(monthTotalSeconds)}
        </span>
        <span className="text-[11px] font-normal text-zinc-500">
          ({monthSessionsCount})
        </span>
      </button>

      {categorySummaries.map((cat) => {
        const isSelected = activeFilter === cat.categoryId;
        return (
          <button
            key={String(cat.categoryId)}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() =>
              onSelectCategory(isSelected ? 'all' : cat.categoryId)
            }
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
              isSelected
                ? 'bg-[#191d28] text-zinc-100 shadow-sm'
                : 'border-white/[0.05] bg-[#151821] text-zinc-400 hover:border-white/[0.1] hover:bg-[#191d28] hover:text-zinc-200'
            }`}
            style={
              isSelected
                ? {
                    borderColor: `${cat.color}80`,
                    backgroundColor: `${cat.color}18`,
                  }
                : undefined
            }
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            <span className="max-w-[140px] truncate">{cat.name}</span>
            <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-normal text-zinc-300">
              {formatDurationHuman(cat.totalSeconds)}
            </span>
            <span className="text-[11px] font-normal text-zinc-500">
              ({cat.sessionCount})
            </span>
          </button>
        );
      })}
    </div>
  );
}
