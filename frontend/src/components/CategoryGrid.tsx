import { LuPlus } from 'react-icons/lu';
import type { Category, CategoryProgress, TimeSession } from '../types';
import { CategoryCard } from './categories/CategoryCard';

interface CategoryGridProps {
  categories: Category[];
  progressByCategory: Record<number, CategoryProgress>;
  activeSession: TimeSession | null;
  activeElapsedSeconds: number;
  onStartOrSwitch: (categoryId: number) => Promise<void>;
  onStop: () => Promise<void>;
  onNewCategory: () => void;
  onEditCategory: (category: Category) => void;
  onArchiveCategory: (category: Category) => void;
}

export function CategoryGrid({
  categories,
  progressByCategory,
  activeSession,
  activeElapsedSeconds,
  onStartOrSwitch,
  onStop,
  onNewCategory,
  onEditCategory,
  onArchiveCategory,
}: CategoryGridProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-medium text-zinc-400">Categories</h2>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#151821]/50 p-10 text-center">
          <p className="text-sm font-medium text-zinc-300">No categories yet</p>
          <p className="mt-1 max-w-sm text-xs text-zinc-500">
            Create a category like Coding, Reading, or Exercise to start
            tracking your daily and weekly progress.
          </p>
          <button
            type="button"
            onClick={onNewCategory}
            className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.08] px-4 py-2 text-xs font-medium text-zinc-100 transition hover:bg-white/[0.14]"
          >
            <LuPlus className="h-3.5 w-3.5" />
            <span>Create category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              progress={progressByCategory[cat.id]}
              isActive={activeSession?.category_id === cat.id}
              isAnySessionRunning={activeSession !== null}
              activeElapsedSeconds={
                activeSession?.category_id === cat.id ? activeElapsedSeconds : 0
              }
              onStartOrSwitch={onStartOrSwitch}
              onStop={onStop}
              onEdit={onEditCategory}
              onArchive={onArchiveCategory}
            />
          ))}
        </div>
      )}
    </section>
  );
}
