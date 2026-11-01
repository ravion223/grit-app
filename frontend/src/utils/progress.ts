import type {
  Category,
  CategoryProgress,
  GlobalProgress,
  TimeSession,
} from '../types';
import { getStartOfToday, getStartOfWeek, parseBackendDate } from './time';

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

    const dPct = dTargetSec ? Math.min(100, (dSec / dTargetSec) * 100) : 0;
    const wPct = wTargetSec ? Math.min(100, (wSec / wTargetSec) * 100) : 0;

    const isDailyComplete = dTargetSec !== null && dSec >= dTargetSec;
    const isWeeklyComplete = wTargetSec !== null && wSec >= wTargetSec;

    if (dTargetSec !== null) {
      totalCategoriesWithDailyGoal += 1;
      dailyTargetSeconds += dTargetSec;
      if (isDailyComplete) {
        completedDailyCategories += 1;
      }
    }

    if (wTargetSec !== null) {
      weeklyTargetSeconds += wTargetSec;
    }

    dailyLoggedSeconds += dSec;
    weeklyLoggedSeconds += wSec;

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
