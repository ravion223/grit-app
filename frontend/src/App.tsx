import { useMemo, useState } from 'react';
import { LuCircleAlert, LuRefreshCw, LuX } from 'react-icons/lu';
import { AccountabilityModal } from './components/AccountabilityModal';
import { ActiveTimerHero } from './components/ActiveTimerHero';
import { ArchiveCategoryModal } from './components/ArchiveCategoryModal';
import { BackgroundGrit } from './components/BackgroundGrit';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryModal } from './components/CategoryModal';
import { CookieJarModal } from './components/CookieJarModal';
import { HeaderProgress } from './components/HeaderProgress';
import { SessionHistory } from './components/SessionHistory';
import { useGritData } from './hooks/useGritData';
import { useTimer } from './hooks/useTimer';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  DailyLogUpsert,
} from './types';
import { calculateProgress } from './utils/progress';
import { getDayKey } from './utils/time';

export function App() {
  const {
    categories,
    sessions,
    dailyLogs,
    dailyLogsMap,
    activeSession,
    loading,
    error,
    setError,
    refresh,
    startOrSwitchSession,
    stopActiveSession,
    createCategory,
    updateCategory,
    archiveCategory,
    updateSession,
    deleteSession,
    upsertDailyLog,
    deleteDailyLog,
  } = useGritData();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [archivingCategory, setArchivingCategory] = useState<Category | null>(
    null,
  );
  const [isShutdownModalOpen, setIsShutdownModalOpen] = useState(false);
  const [shutdownDate, setShutdownDate] = useState<string | undefined>(
    undefined,
  );
  const [isCookieJarOpen, setIsCookieJarOpen] = useState(false);

  const todayKey = useMemo(() => getDayKey(), []);
  const hasShutdownToday = useMemo(
    () => dailyLogsMap.has(todayKey),
    [dailyLogsMap, todayKey],
  );
  const cookieJarCount = useMemo(
    () => dailyLogs.filter((l) => l.is_cookie_jar).length,
    [dailyLogs],
  );

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeSession?.category_id),
    [categories, activeSession],
  );

  const elapsedSeconds = useTimer(activeSession, activeCategory);

  const { byCategory: progressByCategory, global: globalProgress } = useMemo(
    () =>
      calculateProgress(categories, sessions, activeSession, elapsedSeconds),
    [categories, sessions, activeSession, elapsedSeconds],
  );

  const handleOpenShutdown = (date?: string) => {
    setShutdownDate(date || todayKey);
    setIsShutdownModalOpen(true);
  };

  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (
    data: CategoryCreate | CategoryUpdate,
    editingId?: number,
  ) => {
    if (editingId !== undefined) {
      await updateCategory(editingId, data as CategoryUpdate);
    } else {
      await createCategory(data as CategoryCreate);
    }
  };

  const handleConfirmArchive = async (category: Category) => {
    try {
      await archiveCategory(category.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to archive category',
      );
    }
  };

  const handleSaveDailyLog = async (logDate: string, data: DailyLogUpsert) => {
    return await upsertDailyLog(logDate, data);
  };

  return (
    <div className="relative min-h-screen bg-[#0e1015] text-zinc-100">
      <BackgroundGrit
        isActive={activeSession !== null}
        accentColor={activeCategory?.color || '#10B981'}
      />
      <main className="relative z-10 mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <LuCircleAlert className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-rose-200 hover:bg-white/[0.14]"
              >
                <LuRefreshCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="cursor-pointer rounded-full p-1 text-rose-300 hover:bg-white/[0.08]"
              >
                <LuX className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 1. Header & Today / Week Progress */}
        <HeaderProgress
          globalProgress={globalProgress}
          onNewCategory={handleOpenNewCategory}
          onOpenShutdown={() => handleOpenShutdown(todayKey)}
          onOpenCookieJar={() => setIsCookieJarOpen(true)}
          cookieJarCount={cookieJarCount}
          hasShutdownToday={hasShutdownToday}
        />

        {loading ? (
          <div className="space-y-6">
            <div className="h-44 animate-pulse rounded-3xl bg-white/[0.03]" />
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-40 animate-pulse rounded-2xl bg-white/[0.03]"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 2. Centered Chill Timer Hero */}
            <ActiveTimerHero
              activeSession={activeSession}
              activeCategory={activeCategory}
              categories={categories}
              elapsedSeconds={elapsedSeconds}
              activeCategoryProgress={
                activeCategory
                  ? progressByCategory[activeCategory.id]
                  : undefined
              }
              onStartCategory={startOrSwitchSession}
              onStopSession={stopActiveSession}
            />

            {/* 3. Category Cards */}
            <CategoryGrid
              categories={categories}
              progressByCategory={progressByCategory}
              activeSession={activeSession}
              activeElapsedSeconds={elapsedSeconds}
              onStartOrSwitch={startOrSwitchSession}
              onStop={() => stopActiveSession()}
              onNewCategory={handleOpenNewCategory}
              onEditCategory={handleOpenEditCategory}
              onArchiveCategory={(cat) => setArchivingCategory(cat)}
            />

            {/* 4. Session Log */}
            <SessionHistory
              sessions={sessions}
              categories={categories}
              dailyLogsMap={dailyLogsMap}
              onUpdateSession={updateSession}
              onDeleteSession={deleteSession}
              onOpenShutdown={handleOpenShutdown}
            />
          </>
        )}
      </main>

      {/* Create / Edit Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        editingCategory={editingCategory}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Archive Category Confirmation Modal */}
      <ArchiveCategoryModal
        category={archivingCategory}
        onClose={() => setArchivingCategory(null)}
        onConfirm={handleConfirmArchive}
      />

      {/* Daily Shutdown Ritual / Accountability Mirror Modal */}
      <AccountabilityModal
        isOpen={isShutdownModalOpen}
        initialDate={shutdownDate}
        onClose={() => setIsShutdownModalOpen(false)}
        categories={categories}
        sessions={sessions}
        activeSession={activeSession}
        onStopActiveSession={stopActiveSession}
        onSaveDailyLog={handleSaveDailyLog}
        onDeleteDailyLog={deleteDailyLog}
        existingLogs={dailyLogsMap}
      />

      {/* Cookie Jar Modal */}
      <CookieJarModal
        isOpen={isCookieJarOpen}
        onClose={() => setIsCookieJarOpen(false)}
        dailyLogs={dailyLogs}
        sessions={sessions}
        onOpenMirrorForDate={(logDate) => handleOpenShutdown(logDate)}
      />
    </div>
  );
}

export default App;
