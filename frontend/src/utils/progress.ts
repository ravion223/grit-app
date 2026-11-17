import type {
  Category,
  CategoryProgress,
  GlobalProgress,
  TimeSession,
} from '../types';
import {
  getDayKey,
  getStartOfToday,
  getStartOfWeek,
  parseBackendDate,
} from './time';

function getEffectiveTargetSeconds(
  targetMinutes: number | null,
  loggedSeconds: number,
  isArchived: boolean,
): number {
  if (!targetMinutes || targetMinutes <= 0) return 0;
  return isArchived ? loggedSeconds : targetMinutes * 60;
}

export interface DayExecutionStats {
  sessionCount: number;
  totalSeconds: number;
  targetSeconds: number;
  percentage: number;
  isGoalMet: boolean;
}

/**
 * Computes completed-session execution stats and effective daily target for a given day (YYYY-MM-DD).
 */
export function calculateDayStats(
  categories: Category[],
  sessions: TimeSession[],
  dayKey: string,
): DayExecutionStats {
  const loggedByCat: Record<number, number> = {};
  let sessionCount = 0;
  let totalSeconds = 0;

  for (const session of sessions) {
    if (session.end_time === null) continue;
    if (getDayKey(parseBackendDate(session.start_time)) !== dayKey) continue;

    sessionCount += 1;
    const duration = Math.max(0, session.duration_seconds ?? 0);
    totalSeconds += duration;
    loggedByCat[session.category_id] =
      (loggedByCat[session.category_id] ?? 0) + duration;
  }

  let targetSeconds = 0;
  for (const cat of categories) {
    targetSeconds += getEffectiveTargetSeconds(
      cat.daily_target_minutes,
      loggedByCat[cat.id] ?? 0,
      cat.is_archived,
    );
  }

  const percentage =
    targetSeconds > 0
      ? Math.min(100, Math.round((totalSeconds / targetSeconds) * 100))
      : 100;

  return {
    sessionCount,
    totalSeconds,
    targetSeconds,
    percentage,
    isGoalMet: targetSeconds > 0 && totalSeconds >= targetSeconds,
  };
}

export function calculateProgress(
  categories: Category[],
  sessions: TimeSession[],
  activeSession: TimeSession | null,
  activeElapsedSeconds: number,
): {
  byCategory: Record<number, CategoryProgress>;
  global: GlobalProgress;
} {
  const startOfToday = getStartOfToday();
  const startOfWeek = getStartOfWeek();

  const dailyByCat: Record<number, number> = {};
  const weeklyByCat: Record<number, number> = {};

  for (const cat of categories) {
    dailyByCat[cat.id] = 0;
    weeklyByCat[cat.id] = 0;
  }

  for (const session of sessions) {
    if (session.end_time === null) continue;
    const duration = session.duration_seconds ?? 0;
    if (duration <= 0) continue;

    const startTime = parseBackendDate(session.start_time);

    if (startTime >= startOfToday) {
      dailyByCat[session.category_id] =
        (dailyByCat[session.category_id] ?? 0) + duration;
    }
    if (startTime >= startOfWeek) {
      weeklyByCat[session.category_id] =
        (weeklyByCat[session.category_id] ?? 0) + duration;
    }
  }

  if (activeSession && activeElapsedSeconds > 0) {
    const activeCatId = activeSession.category_id;
    dailyByCat[activeCatId] =
      (dailyByCat[activeCatId] ?? 0) + activeElapsedSeconds;
    weeklyByCat[activeCatId] =
      (weeklyByCat[activeCatId] ?? 0) + activeElapsedSeconds;
  }

  const byCategory: Record<number, CategoryProgress> = {};
  let dailyLoggedSeconds = 0;
  let dailyTargetSeconds = 0;
  let weeklyLoggedSeconds = 0;
  let weeklyTargetSeconds = 0;
  let completedDailyCategories = 0;
  let totalCategoriesWithDailyGoal = 0;

  for (const cat of categories) {
    const dSec = dailyByCat[cat.id] ?? 0;
    const wSec = weeklyByCat[cat.id] ?? 0;

    const dTargetSec =
      cat.daily_target_minutes && cat.daily_target_minutes > 0
        ? cat.daily_target_minutes * 60
        : null;
    const wTargetSec =
      cat.weekly_target_minutes && cat.weekly_target_minutes > 0
        ? cat.weekly_target_minutes * 60
        : null;

    dailyLoggedSeconds += dSec;
    weeklyLoggedSeconds += wSec;
    dailyTargetSeconds += getEffectiveTargetSeconds(
      cat.daily_target_minutes,
      dSec,
      cat.is_archived,
    );
    weeklyTargetSeconds += getEffectiveTargetSeconds(
      cat.weekly_target_minutes,
      wSec,
      cat.is_archived,
    );

    if (cat.is_archived) {
      continue;
    }

    const dPct = dTargetSec ? Math.min(100, (dSec / dTargetSec) * 100) : 0;
    const wPct = wTargetSec ? Math.min(100, (wSec / wTargetSec) * 100) : 0;

    const isDailyComplete = dTargetSec !== null && dSec >= dTargetSec;
    const isWeeklyComplete = wTargetSec !== null && wSec >= wTargetSec;

    if (dTargetSec !== null) {
      totalCategoriesWithDailyGoal += 1;
      if (isDailyComplete) {
        completedDailyCategories += 1;
      }
    }

    byCategory[cat.id] = {
      categoryId: cat.id,
      dailySeconds: dSec,
      dailyTargetSeconds: dTargetSec,
      dailyPercentage: dPct,
      isDailyComplete,
      weeklySeconds: wSec,
      weeklyTargetSeconds: wTargetSec,
      weeklyPercentage: wPct,
      isWeeklyComplete,
    };
  }

  const dailyPercentage =
    dailyTargetSeconds > 0
      ? Math.min(100, (dailyLoggedSeconds / dailyTargetSeconds) * 100)
      : 0;
  const weeklyPercentage =
    weeklyTargetSeconds > 0
      ? Math.min(100, (weeklyLoggedSeconds / weeklyTargetSeconds) * 100)
      : 0;

  return {
    byCategory,
    global: {
      dailyLoggedSeconds,
      dailyTargetSeconds,
      dailyPercentage,
      weeklyLoggedSeconds,
      weeklyTargetSeconds,
      weeklyPercentage,
      completedDailyCategories,
      totalCategoriesWithDailyGoal,
    },
  };
}
