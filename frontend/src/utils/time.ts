/**
 * Parses an ISO date string from the backend into a Date object,
 * ensuring UTC interpretation if no timezone offset is present.
 */
export function parseBackendDate(isoString: string): Date {
  if (!isoString) return new Date();
  const hasTimezone =
    isoString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(isoString);
  return new Date(hasTimezone ? isoString : `${isoString}Z`);
}

/**
 * Formats total seconds into HH:MM:SS or MM:SS for the live stopwatch.
 */
export function formatStopwatch(
  totalSeconds: number,
  alwaysShowHours = false,
): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (alwaysShowHours || hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Formats seconds into a compact human-readable duration (e.g. "1h 24m", "45m", "30s").
 */
export function formatDurationHuman(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe === 0) return '0m';
  if (safe < 60) return `${safe}s`;

  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Formats minutes target into a compact label (e.g. 90 -> "1h 30m", 45 -> "45m").
 */
export function formatMinutesTarget(minutes: number): string {
  return formatDurationHuman(minutes * 60);
}

/**
 * Returns local start of today (00:00:00.000).
 */
export function getStartOfToday(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Returns local start of the current week (Monday 00:00:00.000).
 */
export function getStartOfWeek(now = new Date()): Date {
  const day = now.getDay(); // 0 (Sun) to 6 (Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diffToMonday,
    0,
    0,
    0,
    0,
  );
}

/**
 * Formats a session timestamp for the history log (e.g., "Today, 14:30" or "Oct 29, 09:15").
 */
export function formatSessionTimestamp(isoString: string): string {
  const date = parseBackendDate(isoString);
  const todayStart = getStartOfToday();
  const yesterdayStart = new Date(todayStart.getTime() - 86400 * 1000);

  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (date >= todayStart) {
    return `Today, ${timeStr}`;
  }
  if (date >= yesterdayStart) {
    return `Yesterday, ${timeStr}`;
  }
  const dateStr = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Returns local month key in YYYY-MM format (e.g. "2026-11").
 */
export function getMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns local day key in YYYY-MM-DD format (e.g. "2026-11-06").
 */
export function getDayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Shifts a YYYY-MM month key by deltaMonths (e.g. -1 for previous month, +1 for next month).
 */
export function shiftMonthKey(monthKey: string, deltaMonths: number): string {
  const [yStr, mStr] = monthKey.split('-');
  const year = parseInt(yStr, 10);
  const monthIndex = parseInt(mStr, 10) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) {
    return getMonthKey();
  }
  const shifted = new Date(year, monthIndex + deltaMonths, 1);
  return getMonthKey(shifted);
}

/**
 * Formats a YYYY-MM string into a full month & year label (e.g. "November 2026").
 */
export function formatMonthLabel(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const year = parseInt(yStr, 10);
  const monthIndex = parseInt(mStr, 10) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return monthKey;
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

/**
 * Formats a YYYY-MM string into a short month & year label (e.g. "Nov 2026").
 */
export function formatMonthShort(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const year = parseInt(yStr, 10);
  const monthIndex = parseInt(mStr, 10) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return monthKey;
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
}

/**
 * Returns total calendar days in a YYYY-MM month and elapsed days so far (for current month averages).
 */
export function getMonthDayCounts(
  monthKey: string,
  now = new Date(),
): { totalDaysInMonth: number; elapsedDaysInMonth: number } {
  const [yStr, mStr] = monthKey.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10); // 1..12
  if (Number.isNaN(year) || Number.isNaN(month)) {
    return { totalDaysInMonth: 30, elapsedDaysInMonth: 30 };
  }
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const currentMonthKey = getMonthKey(now);

  if (monthKey === currentMonthKey) {
    return {
      totalDaysInMonth,
      elapsedDaysInMonth: Math.max(1, now.getDate()),
    };
  }
  return {
    totalDaysInMonth,
    elapsedDaysInMonth: totalDaysInMonth,
  };
}

/**
 * Formats a YYYY-MM-DD key into a friendly header for daily groupings.
 */
export function formatDayGroupHeader(
  dayKey: string,
  now = new Date(),
): {
  primary: string;
  secondary: string;
  isToday: boolean;
} {
  const todayKey = getDayKey(now);
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  );
  const yesterdayKey = getDayKey(yesterday);

  const [yStr, mStr, dStr] = dayKey.split('-');
  const date = new Date(
    parseInt(yStr, 10),
    parseInt(mStr, 10) - 1,
    parseInt(dStr, 10),
  );

  const isCurrentYear = date.getFullYear() === now.getFullYear();

  const weekdayShort = date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });

  const monthDay = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });

  if (dayKey === todayKey) {
    return {
      primary: 'Today',
      secondary: monthDay,
      isToday: true,
    };
  }
  if (dayKey === yesterdayKey) {
    return {
      primary: 'Yesterday',
      secondary: monthDay,
      isToday: false,
    };
  }
  return {
    primary: weekdayShort,
    secondary: '',
    isToday: false,
  };
}

/**
 * Formats a session's start and end timestamps into a concise local time range (e.g., "14:15 – 15:00").
 */
export function formatSessionTimeRange(
  startIso: string,
  endIso: string | null,
): string {
  const startDate = parseBackendDate(startIso);
  const startStr = startDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (!endIso) return startStr;
  const endDate = parseBackendDate(endIso);
  const endStr = endDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startStr} – ${endStr}`;
}
