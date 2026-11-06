import type { Category, TimeSession } from '../types';
import {
  formatDurationHuman,
  getDayKey,
  getMonthKey,
  parseBackendDate,
} from './time';

/**
 * Escapes a value for safe CSV output (RFC 4180 compliant + formula injection guard).
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Prevent spreadsheet formula injection if a note starts with =, +, -, or @
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats a Date object as local YYYY-MM-DD HH:MM:SS.
 */
function formatLocalDateTime(date: Date): string {
  const dayKey = getDayKey(date);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dayKey} ${hh}:${mm}:${ss}`;
}

/**
 * Builds CSV content for a list of sessions and triggers a browser file download.
 */
export function exportSessionsToCsv(
  sessions: TimeSession[],
  categoryMap: Map<number, Category>,
  filename: string,
): void {
  const headers = [
    'date',
    'month',
    'category_name',
    'start_time_local',
    'end_time_local',
    'start_time_utc',
    'end_time_utc',
    'duration_minutes',
    'duration_human',
    'note',
  ];

  // Sort chronologically (newest first) for consistent backup output
  const sorted = [...sessions].sort(
    (a, b) =>
      parseBackendDate(b.start_time).getTime() -
      parseBackendDate(a.start_time).getTime(),
  );

  const rows = sorted.map((session) => {
    const startDate = parseBackendDate(session.start_time);
    const endDate = session.end_time
      ? parseBackendDate(session.end_time)
      : null;
    const category = categoryMap.get(session.category_id);
    const durationSec = session.duration_seconds ?? 0;
    const durationMin = Number((durationSec / 60).toFixed(2));

    return [
      getDayKey(startDate),
      getMonthKey(startDate),
      category?.name ?? 'Archived',
      formatLocalDateTime(startDate),
      endDate ? formatLocalDateTime(endDate) : '',
      startDate.toISOString(),
      endDate ? endDate.toISOString() : '',
      durationMin,
      formatDurationHuman(durationSec),
      session.note ?? '',
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  // Include UTF-8 BOM so Excel opens unicode characters & symbols properly
  const csvContent = `\uFEFF${[headers.join(','), ...rows].join('\r\n')}\r\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    filename.endsWith('.csv') ? filename : `${filename}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
