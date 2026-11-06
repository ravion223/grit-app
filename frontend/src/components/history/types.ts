import type { TimeSession } from '../../types';

export type CategoryFilterValue = 'all' | 'archived' | number;

export interface CategoryMonthlySummary {
  categoryId: number | 'archived';
  name: string;
  color: string;
  icon: string;
  totalSeconds: number;
  sessionCount: number;
  activeDaysCount: number;
  avgPerActiveDaySeconds: number;
  avgPerCalendarDaySeconds: number;
  dailyTargetSeconds: number | null;
  percentageOfMonth: number;
}

export interface DailyCategoryTotal {
  key: number | 'archived';
  name: string;
  color: string;
  icon: string;
  seconds: number;
}

export interface DailyGroup {
  dayKey: string;
  totalSeconds: number;
  sessions: TimeSession[];
  perCategoryTotals: DailyCategoryTotal[];
}

export interface MonthStat {
  monthKey: string;
  count: number;
  totalSeconds: number;
}

export interface FilteredHistoryStats {
  totalSeconds: number;
  sessionCount: number;
  activeDaysCount: number;
  avgPerActiveDay: number;
  avgPerCalendarDay: number;
}
