import { useEffect, useState } from 'react';
import type { Category, TimeSession } from '../types';
import { formatStopwatch, parseBackendDate } from '../utils/time';

export function useTimer(
  activeSession: TimeSession | null,
  activeCategory: Category | undefined,
): number {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!activeSession) {
      document.title = 'Grit';
      return;
    }

    const startMs = parseBackendDate(activeSession.start_time).getTime();

    const updateTitle = (currentMs: number) => {
      const diffSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));
      const formatted = formatStopwatch(diffSeconds, diffSeconds >= 3600);
      const catName = activeCategory?.name ?? 'Focus';
      document.title = `${formatted} • ${catName} — Grit`;
    };

    updateTitle(Date.now());

    const intervalId = window.setInterval(() => {
      const tickMs = Date.now();
      setNowMs(tickMs);
      updateTitle(tickMs);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSession, activeCategory]);

  if (!activeSession) {
    return 0;
  }

  const startMs = parseBackendDate(activeSession.start_time).getTime();
  return Math.max(0, Math.floor((nowMs - startMs) / 1000));
}
