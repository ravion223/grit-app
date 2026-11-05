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
