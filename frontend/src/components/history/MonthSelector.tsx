import { useEffect, useRef, useState } from 'react';
import {
  LuCalendar,
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuChevronRight,
} from 'react-icons/lu';
import {
  formatDurationHuman,
  formatMonthShort,
  shiftMonthKey,
} from '../../utils/time';
import type { MonthStat } from './types';

interface MonthSelectorProps {
  selectedMonth: string;
  currentMonthKey: string;
  availableMonths: MonthStat[];
  onSelectMonth: (monthKey: string) => void;
}

export function MonthSelector({
  selectedMonth,
  currentMonthKey,
  availableMonths,
  onSelectMonth,
}: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handlePrev = () => {
    onSelectMonth(shiftMonthKey(selectedMonth, -1));
  };

  const handleNext = () => {
    onSelectMonth(shiftMonthKey(selectedMonth, 1));
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center rounded-full border border-white/[0.07] bg-[#151821] p-0.5"
    >
      <button
        type="button"
        onClick={handlePrev}
        title="Previous month"
        aria-label="Previous month"
        className="cursor-pointer rounded-full p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
      >
        <LuChevronLeft className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium text-zinc-200 transition hover:bg-white/[0.05]"
      >
        <LuCalendar className="h-3.5 w-3.5 text-emerald-400" />
        <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-xs font-medium tracking-normal text-zinc-200">
          {selectedMonth}
        </span>
        <span className="hidden text-xs text-zinc-400 sm:inline">
          {formatMonthShort(selectedMonth)}
        </span>
        <LuChevronDown
          className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-zinc-300' : ''
          }`}
        />
      </button>

      <button
        type="button"
        onClick={handleNext}
        title="Next month"
        aria-label="Next month"
        className="cursor-pointer rounded-full p-1.5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
      >
        <LuChevronRight className="h-3.5 w-3.5" />
      </button>

      {/* Month Picker Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 origin-top-right rounded-2xl border border-white/[0.08] bg-[#181b26] p-3 shadow-2xl">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="month-selector-input"
                className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase"
              >
                Select Month (YYYY-MM)
              </label>
              {selectedMonth !== currentMonthKey && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectMonth(currentMonthKey);
                    setIsOpen(false);
                  }}
                  className="cursor-pointer text-[11px] font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Current month
                </button>
              )}
            </div>

            <input
              id="month-selector-input"
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectMonth(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500/50 focus:outline-none [color-scheme:dark]"
            />

            <div className="border-t border-white/[0.06] pt-2">
              <p className="mb-1.5 px-1 text-[11px] text-zinc-500">
                Recorded months
              </p>
              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {availableMonths.map((item) => {
                  const isSelected = item.monthKey === selectedMonth;
                  return (
                    <button
                      key={item.monthKey}
                      type="button"
                      onClick={() => {
                        onSelectMonth(item.monthKey);
                        setIsOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                        isSelected
                          ? 'bg-white/[0.09] text-zinc-100'
                          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal text-zinc-200">
                          {item.monthKey}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {formatMonthShort(item.monthKey)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-zinc-400 font-normal">
                          {formatDurationHuman(item.totalSeconds)}
                        </span>
                        <span className="text-zinc-600">({item.count})</span>
                        {isSelected && (
                          <LuCheck className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
