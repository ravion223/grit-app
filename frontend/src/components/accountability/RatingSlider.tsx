import { LuRotateCcw } from 'react-icons/lu';
import type { RatingDescriptor } from '../../utils/accountability';

interface RatingSliderProps {
  title: string;
  subtitle: string;
  value: number | null;
  descriptors: Record<number, RatingDescriptor>;
  onChange: (val: number | null) => void;
  accentClass?: string;
}

export function RatingSlider({
  title,
  subtitle,
  value,
  descriptors,
  onChange,
  accentClass = 'bg-indigo-500',
}: RatingSliderProps) {
  const activeDescriptor = value !== null ? descriptors[value] : null;

  return (
    <div className="space-y-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-zinc-200">{title}</label>
          <p className="text-[11px] text-zinc-500">{subtitle}</p>
        </div>

        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300"
          >
            <LuRotateCcw className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Slider & Clickable Steps */}
      <div className="space-y-2 pt-1">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value ?? 3}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/[0.08] rounded-lg appearance-none"
        />

        {/* 1-5 Number Chips */}
        <div className="flex justify-between px-1 text-[11px] text-zinc-500 font-medium">
          {[1, 2, 3, 4, 5].map((step) => {
            const isSelected = value === step;
            return (
              <button
                key={step}
                type="button"
                onClick={() => onChange(step)}
                className={`h-6 w-6 rounded-full cursor-pointer transition text-xs flex items-center justify-center ${
                  isSelected
                    ? `${accentClass} text-white font-bold shadow-xs`
                    : 'hover:bg-white/[0.06] hover:text-zinc-300'
                }`}
              >
                {step}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Descriptor Label */}
      {activeDescriptor ? (
        <div
          className="flex items-center justify-between rounded-xl px-3 py-2 text-xs transition"
          style={{
            backgroundColor: activeDescriptor.bgColor,
            color: activeDescriptor.color,
          }}
        >
          <span className="font-semibold">
            {value}. {activeDescriptor.label}
          </span>
          <span className="text-[11px] opacity-85">
            {activeDescriptor.subtitle}
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.02] px-3 py-2 text-[11px] text-zinc-500 italic">
          Optional: Select a rating from 1 to 5
        </div>
      )}
    </div>
  );
}
