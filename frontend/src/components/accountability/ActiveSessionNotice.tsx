import { LuSquare, LuTimer } from 'react-icons/lu';

interface ActiveSessionNoticeProps {
  categoryName?: string;
  stopping: boolean;
  onStop: () => void;
}

export function ActiveSessionNotice({
  categoryName = 'Category',
  stopping,
  onStop,
}: ActiveSessionNoticeProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-200">
      <div className="flex items-center gap-2">
        <span className="relative flex h-4 w-4">
          <LuTimer size={16} className="text-amber-500" />
        </span>
        <span>
          Timer active in{' '}
          <strong className="font-semibold text-amber-100">
            {categoryName}
          </strong>
        </span>
      </div>
      <button
        type="button"
        disabled={stopping}
        onClick={onStop}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-200 transition hover:bg-amber-500/30 disabled:opacity-50"
      >
        <LuSquare className="h-3 w-3 fill-current" />
        <span>{stopping ? 'Stopping...' : 'Stop & Conclude'}</span>
      </button>
    </div>
  );
}
