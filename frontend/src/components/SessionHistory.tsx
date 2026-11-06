import { useMemo, useState } from 'react';
import { sessionsApi } from '../api/sessions';
import type { Category, SessionUpdate, TimeSession } from '../types';
import { exportSessionsToCsv } from '../utils/csv';
import { getDayKey, getMonthKey } from '../utils/time';
import { CategoryFilterTabs } from './history/CategoryFilterTabs';
import { DailySessionGroup } from './history/DailySessionGroup';
import { EmptyHistory } from './history/EmptyHistory';
import { ExportMenu } from './history/ExportMenu';
import { MonthSelector } from './history/MonthSelector';
import { MonthlyAggregates } from './history/MonthlyAggregates';
import { SessionListToolbar } from './history/SessionListToolbar';
import type { CategoryFilterValue } from './history/types';
import { useHistoryData } from './history/useHistoryData';
import { SessionRow } from './SessionRow';

interface SessionHistoryProps {
  sessions: TimeSession[];
  categories: Category[];
  onUpdateSession: (id: number, data: SessionUpdate) => Promise<TimeSession>;
  onDeleteSession: (id: number) => Promise<void>;
}

export function SessionHistory({
  sessions,
  categories,
  onUpdateSession,
  onDeleteSession,
}: SessionHistoryProps) {
  const currentMonthKey = useMemo(() => getMonthKey(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterValue>('all');
  const [groupByDay, setGroupByDay] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const {
    categoryMap,
    allCompletedSessions,
    availableMonths,
    monthSessions,
    elapsedDaysInMonth,
    categorySummaries,
    monthTotalSeconds,
    activeFilter,
    activeFilterLabel,
    filteredSessions,
    filteredStats,
    dailyGroups,
    latestActiveMonth,
  } = useHistoryData({
    sessions,
    categories,
    selectedMonth,
    selectedCategory,
    sortOrder,
    currentMonthKey,
  });

  const handleExportCurrentView = () => {
    const catSlug =
      activeFilter === 'all'
        ? 'all-categories'
        : activeFilterLabel
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    const filename = `grit-log-${selectedMonth}-${catSlug}.csv`;
    exportSessionsToCsv(filteredSessions, categoryMap, filename);
  };

  const handleExportFullBackup = async () => {
    let allToExport = allCompletedSessions;
    try {
      const fetched = await sessionsApi.getAll({ limit: 10000 });
      allToExport = fetched.filter((s) => s.end_time !== null);
    } catch {
      // Fallback to in-memory completed sessions if request fails
    }
    const filename = `grit-backup-all-sessions-${getDayKey()}.csv`;
    exportSessionsToCsv(allToExport, categoryMap, filename);
  };

  return (
    <section className="space-y-4">
      {/* 1. Header with Title, Month Selector & CSV Export */}
      <div className="flex flex-col justify-between gap-3 px-1 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-medium text-zinc-300">
            Monthly &amp; Category Log
          </h2>
          <p className="text-xs font-normal text-zinc-500">
            Aggregated category totals, daily breakdowns &amp; session history
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <MonthSelector
            selectedMonth={selectedMonth}
            currentMonthKey={currentMonthKey}
            availableMonths={availableMonths}
            onSelectMonth={(monthKey) => setSelectedMonth(monthKey)}
          />

          <ExportMenu
            selectedMonth={selectedMonth}
            activeFilterLabel={activeFilterLabel}
            filteredSessionsCount={filteredSessions.length}
            filteredTotalSeconds={filteredStats.totalSeconds}
            totalCompletedSessionsCount={allCompletedSessions.length}
            onExportCurrentView={handleExportCurrentView}
            onExportFullBackup={handleExportFullBackup}
          />
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <CategoryFilterTabs
        activeFilter={activeFilter}
        monthTotalSeconds={monthTotalSeconds}
        monthSessionsCount={monthSessions.length}
        categorySummaries={categorySummaries}
        onSelectCategory={(val) => setSelectedCategory(val)}
      />

      {/* 3. Aggregated Monthly & Daily Totals Panel */}
      <MonthlyAggregates
        selectedMonth={selectedMonth}
        activeFilter={activeFilter}
        activeFilterLabel={activeFilterLabel}
        filteredStats={filteredStats}
        monthTotalSeconds={monthTotalSeconds}
        elapsedDaysInMonth={elapsedDaysInMonth}
        categorySummaries={categorySummaries}
        onSelectCategory={(val) => setSelectedCategory(val)}
      />

      {/* 4. Chronological Session List Toolbar */}
      <SessionListToolbar
        filteredSessionsCount={filteredSessions.length}
        groupByDay={groupByDay}
        sortOrder={sortOrder}
        onToggleGroupByDay={(val) => setGroupByDay(val)}
        onToggleSortOrder={() =>
          setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
        }
      />

      {/* 5. Session List Content */}
      {filteredSessions.length === 0 ? (
        <EmptyHistory
          selectedMonth={selectedMonth}
          activeFilter={activeFilter}
          activeFilterLabel={activeFilterLabel}
          latestActiveMonth={latestActiveMonth}
          onSelectCategory={(val) => setSelectedCategory(val)}
          onSelectMonth={(monthKey) => {
            setSelectedMonth(monthKey);
            setSelectedCategory('all');
          }}
        />
      ) : groupByDay ? (
        <div className="space-y-3">
          {dailyGroups.map((group) => (
            <DailySessionGroup
              key={group.dayKey}
              group={group}
              categoryMap={categoryMap}
              onUpdateSession={onUpdateSession}
              onDeleteSession={onDeleteSession}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.05] bg-[#151821] p-2">
          <div className="divide-y divide-white/[0.04]">
            {filteredSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                category={categoryMap.get(session.category_id)}
                compactDate={false}
                onUpdate={onUpdateSession}
                onDelete={onDeleteSession}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
