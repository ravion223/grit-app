import { useState } from 'react';
import type { Category } from '../types';

interface ArchiveCategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onConfirm: (category: Category) => Promise<void>;
}

export function ArchiveCategoryModal({
  category,
  onClose,
  onConfirm,
}: ArchiveCategoryModalProps) {
  const [busy, setBusy] = useState(false);

  if (!category) return null;

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm(category);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl border border-white/[0.08] bg-[#161922] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-zinc-100">
          Archive &ldquo;{category.name}&rdquo;?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          This hides the category from your dashboard while keeping all past
          sessions intact.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="cursor-pointer rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className="cursor-pointer rounded-full bg-rose-500/90 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
          >
            {busy ? 'Archiving...' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}
