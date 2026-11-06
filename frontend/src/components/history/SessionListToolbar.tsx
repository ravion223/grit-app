import { LuArrowDownUp, LuLayers, LuList } from 'react-icons/lu';

interface SessionListToolbarProps {
  filteredSessionsCount: number;
  groupByDay: boolean;
  sortOrder: 'desc' | 'asc';
  onToggleGroupByDay: (val: boolean) => void;
  onToggleSortOrder: () => void;
}

export function SessionListToolbar({
  filteredSessionsCount,
  groupByDay,
  sortOrder,
  onToggleGroupByDay,
  onToggleSortOrder,
}: SessionListToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium text-zinc-400">
          Chronological Sessions
        </h3>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-normal text-zinc-400">
          {filteredSessionsCount}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Group by Day vs Flat List Toggle */}
        <div className="inline-flex items-center rounded-lg border border-white/[0.06] bg-[#151821] p-0.5">
          <button
            type="button"
            onClick={() => onToggleGroupByDay(true)}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
              groupByDay
                ? 'bg-white/[0.09] text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LuLayers className="h-3 w-3" />
            <span>Daily groups</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleGroupByDay(false)}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition ${
              !groupByDay
                ? 'bg-white/[0.09] text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <LuList className="h-3 w-3" />
            <span>Flat list</span>
          </button>
        </div>

        {/* Sort Order Toggle */}
        <button
          type="button"
          onClick={onToggleSortOrder}
          title={
            sortOrder === 'desc'
              ? 'Showing newest first (click for oldest first)'
              : 'Showing oldest first (click for newest first)'
          }
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/[0.06] bg-[#151821] px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:border-white/[0.12] hover:text-zinc-200"
        >
          <LuArrowDownUp className="h-3 w-3" />
          <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
        </button>
      </div>
    </div>
  );
}
