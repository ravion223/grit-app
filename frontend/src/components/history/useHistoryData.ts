import { useMemo } from 'react';
import type { Category, DailyLog, TimeSession } from '../../types';
import {
  getDayKey,
  getMonthDayCounts,
  getMonthKey,
  parseBackendDate,
} from '../../utils/time';
import type {
  CategoryFilterValue,
  CategoryMonthlySummary,
  DailyCategoryTotal,
  DailyGroup,
  FilteredHistoryStats,
  MonthStat,
} from './types';

interface UseHistoryDataParams {
  sessions: TimeSession[];
  categories: Category[];
  dailyLogsMap: Map<string, DailyLog>;
  selectedMonth: string;
  selectedCategory: CategoryFilterValue;
  sortOrder: 'desc' | 'asc';
  currentMonthKey: string;
}

export function useHistoryData({
  sessions,
  categories,
  dailyLogsMap,
  selectedMonth,
  selectedCategory,
  sortOrder,
  currentMonthKey,
}: UseHistoryDataParams) {
  const categoryMap = useMemo(
    () => new Map(categories.map((cat) => [cat.id, cat])),
    [categories],
  );

  // Completed sessions only
  const allCompletedSessions = useMemo(
    () => sessions.filter((s) => s.end_time !== null),
    [sessions],
  );

  // Available months summary across all history (always includes currentMonthKey)
  const availableMonths: MonthStat[] = useMemo(() => {
    const map = new Map<string, { count: number; totalSeconds: number }>();
    map.set(currentMonthKey, { count: 0, totalSeconds: 0 });

    for (const s of allCompletedSessions) {
      const mKey = getMonthKey(parseBackendDate(s.start_time));
      const prev = map.get(mKey) ?? { count: 0, totalSeconds: 0 };
      prev.count += 1;
      prev.totalSeconds += s.duration_seconds ?? 0;
      map.set(mKey, prev);
    }

    for (const logDate of dailyLogsMap.keys()) {
      const mKey = logDate.slice(0, 7);
      if (!map.has(mKey)) {
        map.set(mKey, { count: 0, totalSeconds: 0 });
      }
    }

    return Array.from(map.entries())
      .map(([monthKey, stats]) => ({
        monthKey,
        count: stats.count,
        totalSeconds: stats.totalSeconds,
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [allCompletedSessions, dailyLogsMap, currentMonthKey]);

  // Sessions within the selected YYYY-MM month
  const monthSessions = useMemo(
    () =>
      allCompletedSessions.filter(
        (s) => getMonthKey(parseBackendDate(s.start_time)) === selectedMonth,
      ),
    [allCompletedSessions, selectedMonth],
  );

  const { elapsedDaysInMonth } = useMemo(
    () => getMonthDayCounts(selectedMonth),
    [selectedMonth],
  );

  // Compute aggregated monthly & daily stats per category for the selected month
  const {
    categorySummaries,
    monthTotalSeconds,
    monthActiveDaysCount,
    hasArchivedSessionsInMonth,
  } = useMemo(() => {
    let totalSec = 0;
    const allMonthDays = new Set<string>();
    const byCat = new Map<
      number | 'archived',
      {
        seconds: number;
        count: number;
        days: Set<string>;
      }
    >();

    for (const cat of categories) {
      byCat.set(cat.id, { seconds: 0, count: 0, days: new Set() });
    }

    let archivedFlag = false;

    for (const s of monthSessions) {
      const dur = Math.max(0, s.duration_seconds ?? 0);
      const sDate = parseBackendDate(s.start_time);
      const dKey = getDayKey(sDate);
      totalSec += dur;
      allMonthDays.add(dKey);

      const isKnownCat = categoryMap.has(s.category_id);
      const key: number | 'archived' = isKnownCat ? s.category_id : 'archived';
      if (!isKnownCat) {
        archivedFlag = true;
      }

      const entry = byCat.get(key) ?? {
        seconds: 0,
        count: 0,
        days: new Set<string>(),
      };
      entry.seconds += dur;
      entry.count += 1;
      entry.days.add(dKey);
      byCat.set(key, entry);
    }

    const summaries: CategoryMonthlySummary[] = [];

    for (const cat of categories) {
      const stats = byCat.get(cat.id) ?? {
        seconds: 0,
        count: 0,
        days: new Set<string>(),
      };
      const activeDays = stats.days.size;
      summaries.push({
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        totalSeconds: stats.seconds,
        sessionCount: stats.count,
        activeDaysCount: activeDays,
        avgPerActiveDaySeconds:
          activeDays > 0 ? Math.round(stats.seconds / activeDays) : 0,
        avgPerCalendarDaySeconds:
          elapsedDaysInMonth > 0
            ? Math.round(stats.seconds / elapsedDaysInMonth)
            : 0,
        dailyTargetSeconds:
          cat.daily_target_minutes && cat.daily_target_minutes > 0
            ? cat.daily_target_minutes * 60
            : null,
        percentageOfMonth: totalSec > 0 ? (stats.seconds / totalSec) * 100 : 0,
      });
    }

    if (archivedFlag) {
      const archStats = byCat.get('archived')!;
      const activeDays = archStats.days.size;
      summaries.push({
        categoryId: 'archived',
        name: 'Archived',
        color: '#71717a',
        icon: 'zap',
        totalSeconds: archStats.seconds,
        sessionCount: archStats.count,
        activeDaysCount: activeDays,
        avgPerActiveDaySeconds:
          activeDays > 0 ? Math.round(archStats.seconds / activeDays) : 0,
        avgPerCalendarDaySeconds:
          elapsedDaysInMonth > 0
            ? Math.round(archStats.seconds / elapsedDaysInMonth)
            : 0,
        dailyTargetSeconds: null,
        percentageOfMonth:
          totalSec > 0 ? (archStats.seconds / totalSec) * 100 : 0,
      });
    }

    // Sort categories with highest logged time first, then by name
    summaries.sort((a, b) => {
      if (b.totalSeconds !== a.totalSeconds) {
        return b.totalSeconds - a.totalSeconds;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      categorySummaries: summaries,
      monthTotalSeconds: totalSec,
      monthActiveDaysCount: allMonthDays.size,
      hasArchivedSessionsInMonth: archivedFlag,
    };
  }, [monthSessions, categories, categoryMap, elapsedDaysInMonth]);

  // Ensure selectedCategory falls back to 'all' if it's no longer valid
  const activeFilter: CategoryFilterValue = useMemo(() => {
    if (selectedCategory === 'all') return 'all';
    if (selectedCategory === 'archived') {
      return hasArchivedSessionsInMonth ? 'archived' : 'all';
    }
    return categoryMap.has(selectedCategory) ? selectedCategory : 'all';
  }, [selectedCategory, hasArchivedSessionsInMonth, categoryMap]);

  // Filtered sessions for the selected month + selected category tab
  const filteredSessions = useMemo(() => {
    const matching = monthSessions.filter((s) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'archived') {
        return !categoryMap.has(s.category_id);
      }
      return s.category_id === activeFilter;
    });

    return [...matching].sort((a, b) => {
      const diff =
        parseBackendDate(b.start_time).getTime() -
        parseBackendDate(a.start_time).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });
  }, [monthSessions, activeFilter, categoryMap, sortOrder]);

  // Filtered summary metrics (respects active category tab)
  const filteredStats: FilteredHistoryStats = useMemo(() => {
    if (activeFilter === 'all') {
      return {
        totalSeconds: monthTotalSeconds,
        sessionCount: monthSessions.length,
        activeDaysCount: monthActiveDaysCount,
        avgPerActiveDay:
          monthActiveDaysCount > 0
            ? Math.round(monthTotalSeconds / monthActiveDaysCount)
            : 0,
        avgPerCalendarDay:
          elapsedDaysInMonth > 0
            ? Math.round(monthTotalSeconds / elapsedDaysInMonth)
            : 0,
      };
    }

    const catSummary = categorySummaries.find(
      (c) => c.categoryId === activeFilter,
    );
    return {
      totalSeconds: catSummary?.totalSeconds ?? 0,
      sessionCount: catSummary?.sessionCount ?? 0,
      activeDaysCount: catSummary?.activeDaysCount ?? 0,
      avgPerActiveDay: catSummary?.avgPerActiveDaySeconds ?? 0,
      avgPerCalendarDay: catSummary?.avgPerCalendarDaySeconds ?? 0,
    };
  }, [
    activeFilter,
    monthTotalSeconds,
    monthSessions.length,
    monthActiveDaysCount,
    elapsedDaysInMonth,
    categorySummaries,
  ]);

  // Group filtered sessions by day (YYYY-MM-DD) with daily per-category totals
  const dailyGroups: DailyGroup[] = useMemo(() => {
    const groupsMap = new Map<
      string,
      {
        sessions: TimeSession[];
        totalSeconds: number;
        catSeconds: Map<number | 'archived', number>;
      }
    >();

    for (const s of filteredSessions) {
      const dKey = getDayKey(parseBackendDate(s.start_time));
      const dur = Math.max(0, s.duration_seconds ?? 0);
      const isKnown = categoryMap.has(s.category_id);
      const cKey: number | 'archived' = isKnown ? s.category_id : 'archived';

      const existing = groupsMap.get(dKey) ?? {
        sessions: [],
        totalSeconds: 0,
        catSeconds: new Map<number | 'archived', number>(),
      };

      existing.sessions.push(s);
      existing.totalSeconds += dur;
      existing.catSeconds.set(cKey, (existing.catSeconds.get(cKey) ?? 0) + dur);
      groupsMap.set(dKey, existing);
    }

    if (activeFilter === 'all') {
      for (const logDate of dailyLogsMap.keys()) {
        if (logDate.startsWith(selectedMonth) && !groupsMap.has(logDate)) {
          groupsMap.set(logDate, {
            sessions: [],
            totalSeconds: 0,
            catSeconds: new Map<number | 'archived', number>(),
          });
        }
      }
    }

    const groups: DailyGroup[] = Array.from(groupsMap.entries()).map(
      ([dayKey, data]) => {
        const perCategoryTotals: DailyCategoryTotal[] = Array.from(
          data.catSeconds.entries(),
        )
          .map(([key, seconds]) => {
            if (key === 'archived') {
              return {
                key,
                name: 'Archived',
                color: '#71717a',
                icon: 'zap',
                seconds,
              };
            }
            const cat = categoryMap.get(key);
            return {
              key,
              name: cat?.name ?? 'Archived',
              color: cat?.color ?? '#71717a',
              icon: cat?.icon ?? 'zap',
              seconds,
            };
          })
          .sort((a, b) => b.seconds - a.seconds);

        return {
          dayKey,
          totalSeconds: data.totalSeconds,
          sessions: data.sessions,
          perCategoryTotals,
          dailyLog: dailyLogsMap.get(dayKey) ?? null,
        };
      },
    );

    groups.sort((a, b) =>
      sortOrder === 'desc'
        ? b.dayKey.localeCompare(a.dayKey)
        : a.dayKey.localeCompare(b.dayKey),
    );

    return groups;
  }, [
    filteredSessions,
    categoryMap,
    sortOrder,
    activeFilter,
    dailyLogsMap,
    selectedMonth,
  ]);

  const activeFilterLabel = useMemo(() => {
    if (activeFilter === 'all') return 'All Categories';
    if (activeFilter === 'archived') return 'Archived';
    return categoryMap.get(activeFilter)?.name ?? 'Category';
  }, [activeFilter, categoryMap]);

  const latestActiveMonth = useMemo(() => {
    const withSessions = availableMonths.find((m) => m.count > 0);
    return withSessions?.monthKey ?? null;
  }, [availableMonths]);

  return {
    categoryMap,
    allCompletedSessions,
    availableMonths,
    monthSessions,
    elapsedDaysInMonth,
    categorySummaries,
    monthTotalSeconds,
    monthActiveDaysCount,
    hasArchivedSessionsInMonth,
    activeFilter,
    activeFilterLabel,
    filteredSessions,
    filteredStats,
    dailyGroups,
    latestActiveMonth,
  };
}
