import { useState } from 'react';
import { LuCheck, LuX } from 'react-icons/lu';
import type { Category, CategoryCreate, CategoryUpdate } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../utils/icons';
import { formatMinutesTarget } from '../utils/time';

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory: Category | null;
  onClose: () => void;
  onSave: (
    data: CategoryCreate | CategoryUpdate,
    editingId?: number,
  ) => Promise<void>;
}

const DAILY_PRESETS = [30, 60, 90, 120, 180];
const WEEKLY_PRESETS = [180, 300, 600, 900, 1200];

export function CategoryModal({
  isOpen,
  editingCategory,
  onClose,
  onSave,
}: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <CategoryModalForm
      key={editingCategory?.id ?? 'new'}
      editingCategory={editingCategory}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function CategoryModalForm({
  editingCategory,
  onClose,
  onSave,
}: Omit<CategoryModalProps, 'isOpen'>) {
  const [name, setName] = useState(() => editingCategory?.name ?? '');
  const [color, setColor] = useState(() => editingCategory?.color || '#10B981');
  const [icon, setIcon] = useState(() => editingCategory?.icon || 'zap');
  const [dailyMinutes, setDailyMinutes] = useState<string>(() =>
    editingCategory
      ? editingCategory.daily_target_minutes !== null
        ? String(editingCategory.daily_target_minutes)
        : ''
      : '60',
  );
  const [weeklyMinutes, setWeeklyMinutes] = useState<string>(() =>
    editingCategory
      ? editingCategory.weekly_target_minutes !== null
        ? String(editingCategory.weekly_target_minutes)
        : ''
      : '300',
  );
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    const parsedDaily =
      dailyMinutes.trim() === '' ? null : Number(dailyMinutes);
    const parsedWeekly =
      weeklyMinutes.trim() === '' ? null : Number(weeklyMinutes);

    if (
      parsedDaily !== null &&
      (Number.isNaN(parsedDaily) || parsedDaily < 0)
    ) {
      setFormError('Daily target must be 0 or more minutes.');
      return;
    }
    if (
      parsedWeekly !== null &&
      (Number.isNaN(parsedWeekly) || parsedWeekly < 0)
    ) {
      setFormError('Weekly target must be 0 or more minutes.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave(
        {
          name: trimmedName,
          color,
          icon,
          daily_target_minutes: parsedDaily,
          weekly_target_minutes: parsedWeekly,
        },
        editingCategory?.id,
      );
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to save category.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-[#161922] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-base font-semibold text-zinc-100">
            {editingCategory ? 'Edit category' : 'New category'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-6 pt-2">
          {formError && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300">
              {formError}
            </div>
          )}

          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Coding, Reading, Workout"
              maxLength={50}
              autoFocus
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-white/[0.2] focus:bg-white/[0.05] focus:outline-none"
            />
          </div>

          {/* Color Swatches */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400">
              Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {CATEGORY_COLORS.map((swatch) => {
                const selected =
                  color.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setColor(swatch.hex)}
                    title={swatch.name}
                    className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: swatch.hex,
                      boxShadow: selected
                        ? `0 0 0 2px #161922, 0 0 0 4px ${swatch.hex}`
                        : undefined,
                    }}
                  >
                    {selected && <LuCheck className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400">
              Icon
            </label>
            <div className="grid grid-cols-10 gap-1.5 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-2">
              {CATEGORY_ICONS.map((opt) => {
                const selected = icon === opt.key;
                const IconComp = opt.Icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    title={opt.label}
                    onClick={() => setIcon(opt.key)}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${
                      selected
                        ? 'text-white'
                        : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                    }`}
                    style={{
                      backgroundColor: selected ? color : undefined,
                    }}
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Targets: Daily & Weekly */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Daily Target */}
            <div className="space-y-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">
                  Daily goal (min)
                </label>
                {dailyMinutes && Number(dailyMinutes) > 0 && (
                  <span className="text-[11px] text-zinc-500 font-normal">
                    {formatMinutesTarget(Number(dailyMinutes))}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-100 focus:border-white/[0.2] focus:outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {DAILY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDailyMinutes(String(preset))}
                    className={`cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-normal transition ${
                      Number(dailyMinutes) === preset
                        ? 'bg-white/[0.16] text-white'
                        : 'bg-white/[0.04] text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300'
                    }`}
                  >
                    {formatMinutesTarget(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Target */}
            <div className="space-y-2 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">
                  Weekly goal (min)
                </label>
                {weeklyMinutes && Number(weeklyMinutes) > 0 && (
                  <span className="text-[11px] text-zinc-500 font-normal">
                    {formatMinutesTarget(Number(weeklyMinutes))}
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                value={weeklyMinutes}
                onChange={(e) => setWeeklyMinutes(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-sm text-zinc-100 focus:border-white/[0.2] focus:outline-none"
              />
              <div className="flex flex-wrap gap-1">
                {WEEKLY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWeeklyMinutes(String(preset))}
                    className={`cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-normal transition ${
                      Number(weeklyMinutes) === preset
                        ? 'bg-white/[0.16] text-white'
                        : 'bg-white/[0.04] text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300'
                    }`}
                  >
                    {formatMinutesTarget(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer rounded-full bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingCategory ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
