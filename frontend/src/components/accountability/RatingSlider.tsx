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
}: RatingSliderProps) {
  const activeDescriptor = value !== null ? descriptors[value] : null;
  const displayValue = value ?? 3;
  const percentage = ((displayValue - 1) / 4) * 100;

  // Icon for the level the slider is currently on
  const CurrentIcon = activeDescriptor?.Icon ?? descriptors[3]?.Icon;

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
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-zinc-500 transition hover:text-zinc-300"
          >
            <LuRotateCcw className="h-3 w-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Slider with Icon Thumb */}
      <div className="space-y-2 pt-1">
        <div className="relative flex h-9 items-center select-none">
          {/* Base Track */}
          <div className="absolute inset-x-0 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            {/* Active Track Fill */}
            <div
              className="h-full rounded-full transition-all duration-150"
              style={{
                width:
                  value !== null
                    ? value === 5
                      ? '100%'
                      : `calc(${percentage}% + ${(0.5 - percentage / 100) * 24}px)`
                    : '0%',
                backgroundColor: activeDescriptor?.color ?? '#6366f1',
                opacity: 0.35,
              }}
            />
          </div>

          {/* Step markers along the track */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
            {[1, 2, 3, 4, 5].map((step) => {
              const stepFraction = (step - 1) / 4;
              const isPast = value !== null && step <= value;
              return (
                <span
                  key={step}
                  className={`absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full transition-all duration-200 ${
                    isPast ? 'bg-white/40' : 'bg-white/10'
                  }`}
                  style={{
                    left: `calc(${stepFraction * 100}% + ${(0.5 - stepFraction) * 24}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              );
            })}
          </div>

          {/* Level Icon Thumb (pure icon without container or dark background) */}
          <div
            className="pointer-events-none absolute top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center transition-all duration-150"
            style={{
              left: `calc(${percentage}% + ${(0.5 - percentage / 100) * 24}px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {CurrentIcon && (
              <CurrentIcon
                className="h-5.5 w-5.5 transition-transform duration-150"
                style={{
                  color: activeDescriptor ? activeDescriptor.color : '#71717a',
                  opacity: value !== null ? 1 : 0.4,
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8))',
                }}
              />
            )}
          </div>

          {/* Native range input for accessible mouse/touch/keyboard drag */}
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={displayValue}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={title}
            aria-valuetext={activeDescriptor?.label ?? 'Not selected'}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none"
          />
        </div>

        {/* 1-5 Number Step Chips */}
        <div className="flex justify-between px-1 text-[11px] font-medium text-zinc-500">
          {[1, 2, 3, 4, 5].map((step) => {
            const isSelected = value === step;
            const desc = descriptors[step];
            return (
              <button
                key={step}
                type="button"
                onClick={() => onChange(step)}
                title={`${step}. ${desc?.label ?? ''}`}
                className={`flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-full text-xs transition ${
                  isSelected
                    ? 'font-bold shadow-xs'
                    : 'hover:bg-white/[0.06] hover:text-zinc-300'
                }`}
                style={
                  isSelected && desc
                    ? {
                        backgroundColor: desc.bgColor,
                        color: desc.color,
                      }
                    : undefined
                }
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
          <div className="flex items-center gap-2">
            {activeDescriptor.Icon && (
              <activeDescriptor.Icon className="h-4 w-4 shrink-0" />
            )}
            <span className="font-semibold">
              {value}. {activeDescriptor.label}
            </span>
          </div>
          <span className="text-[11px] opacity-85">
            {activeDescriptor.subtitle}
          </span>
        </div>
      ) : (
        <div className="rounded-xl bg-white/[0.02] px-3 py-2 text-[11px] text-zinc-500 italic">
          Optional: Drag or click to set a rating from 1 to 5
        </div>
      )}
    </div>
  );
}
