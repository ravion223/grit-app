export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  daily_target_minutes: number | null;
  weekly_target_minutes: number | null;
  is_archived: boolean;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  color?: string;
  icon?: string;
  daily_target_minutes?: number | null;
  weekly_target_minutes?: number | null;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
  icon?: string;
  daily_target_minutes?: number | null;
  weekly_target_minutes?: number | null;
}

export interface TimeSession {
  id: number;
  category_id: number;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  note: string | null;
}

export interface SessionCreate {
  category_id: number;
}

export interface SessionUpdate {
  duration_seconds?: number;
  note?: string | null;
}

export interface CategoryProgress {
  categoryId: number;
  dailySeconds: number;
  dailyTargetSeconds: number | null;
  dailyPercentage: number;
  isDailyComplete: boolean;
  weeklySeconds: number;
  weeklyTargetSeconds: number | null;
  weeklyPercentage: number;
  isWeeklyComplete: boolean;
}

export interface GlobalProgress {
  dailyLoggedSeconds: number;
  dailyTargetSeconds: number;
  dailyPercentage: number;
  weeklyLoggedSeconds: number;
  weeklyTargetSeconds: number;
  weeklyPercentage: number;
  completedDailyCategories: number;
  totalCategoriesWithDailyGoal: number;
}
