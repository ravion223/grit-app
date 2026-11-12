import { useEffect, useRef, useState } from 'react';
import {
  LuCheck,
  LuChevronDown,
  LuDownload,
  LuFileSpreadsheet,
} from 'react-icons/lu';
import { formatDurationHuman } from '../../utils/time';

interface ExportMenuProps {
  selectedMonth: string;
  activeFilterLabel: string;
  filteredSessionsCount: number;
  filteredTotalSeconds: number;
  totalCompletedSessionsCount: number;
  onExportCurrentView: () => void;
  onExportFullBackup: () => Promise<void>;
}

export function ExportMenu({
  selectedMonth,
  activeFilterLabel,
  filteredSessionsCount,
  filteredTotalSeconds,
  totalCompletedSessionsCount,
  onExportCurrentView,
  onExportFullBackup,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [successLabel, setSuccessLabel] = useState<string | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  const showFeedback = (label: string) => {
    setSuccessLabel(label);
    window.setTimeout(() => {
      setSuccessLabel(null);
    }, 2500);
  };

  const handleCurrentViewClick = () => {
    onExportCurrentView();
    setIsOpen(false);
    showFeedback('Exported view');
  };

  const handleBackupClick = async () => {
    setIsExportingBackup(true);
    try {
      await onExportFullBackup();
      setIsOpen(false);
      showFeedback('Backup exported');
    } finally {
      setIsExportingBackup(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/[0.07] bg-[#151821] px-3.5 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/[0.14] hover:bg-[#191d28]"
      >
        {successLabel ? (
          <>
            <LuCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-normal">{successLabel}</span>
          </>
        ) : (
          <>
            <LuDownload className="h-3.5 w-3.5 text-zinc-400" />
            <span>Export CSV</span>
            <LuChevronDown
              className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-zinc-300' : ''
              }`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 origin-top-right rounded-2xl border border-white/[0.08] bg-[#181b26] p-1.5 shadow-2xl">
          <button
            type="button"
            disabled={filteredSessionsCount === 0}
            onClick={handleCurrentViewClick}
            className="flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LuFileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-100">
                Export filtered view ({selectedMonth})
              </p>
              <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                {activeFilterLabel} · {filteredSessionsCount} session
                {filteredSessionsCount === 1 ? '' : 's'} (
                {formatDurationHuman(filteredTotalSeconds)})
              </p>
            </div>
          </button>

          <div className="my-1 border-t border-white/[0.05]" />

          <button
            type="button"
            disabled={totalCompletedSessionsCount === 0 || isExportingBackup}
            onClick={() => void handleBackupClick()}
            className="flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LuDownload className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-100">
                {isExportingBackup
                  ? 'Preparing full backup...'
                  : 'Export full backup (All history)'}
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                All months &amp; categories · {totalCompletedSessionsCount}{' '}
                session
                {totalCompletedSessionsCount === 1 ? '' : 's'}
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
