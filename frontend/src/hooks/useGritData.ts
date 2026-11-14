import { useCallback, useEffect, useMemo, useState } from 'react';
import { categoriesApi } from '../api/categories';
import {
  clearStoredSecretKey,
  getStoredSecretKey,
  isUnauthorizedError,
  setStoredSecretKey,
  subscribeUnauthorized,
} from '../api/client';
import { dailyLogsApi } from '../api/dailyLogs';
import { sessionsApi } from '../api/sessions';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  DailyLog,
  DailyLogUpsert,
  SessionUpdate,
  TimeSession,
} from '../types';

export function useGritData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(
    () => !getStoredSecretKey(),
  );
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(getStoredSecretKey()),
  );
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async (sessionLimit = 2000) => {
    const [catsData, sessionsData, activeData, logsData] = await Promise.all([
      categoriesApi.getAll(),
      sessionsApi.getAll({ limit: sessionLimit }),
      sessionsApi.getActive(),
      dailyLogsApi.getAll(),
    ]);
    setCategories(catsData);
    setSessions(sessionsData);
    setActiveSession(activeData);
    setDailyLogs(logsData);
  }, []);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await loadAllData(2000);
      setIsLocked(false);
    } catch (err) {
      if (isUnauthorizedError(err)) {
        setIsLocked(true);
        return;
      }
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the Grit API server.';
      setError(msg);
    }
  }, [loadAllData]);

  const unlock = useCallback(
    async (secretKey: string) => {
      const trimmed = secretKey.trim();
      if (!trimmed) {
        throw new Error('Please enter your access key.');
      }
      setStoredSecretKey(trimmed);
      setLoading(true);
      try {
        await loadAllData(2000);
        setIsLocked(false);
        setError(null);
      } catch (err) {
        if (isUnauthorizedError(err)) {
          clearStoredSecretKey();
          setIsLocked(true);
          throw new Error('Invalid access key.', { cause: err });
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadAllData],
  );

  useEffect(() => {
    const unsubscribe = subscribeUnauthorized(() => {
      setIsLocked(true);
      setError(null);
    });

    if (!getStoredSecretKey()) {
      return unsubscribe;
    }

    let cancelled = false;
    (async () => {
      try {
        await loadAllData(2000);
        if (!cancelled) {
          setIsLocked(false);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          if (isUnauthorizedError(err)) {
            setIsLocked(true);
          } else {
            const msg =
              err instanceof Error
                ? err.message
                : 'Unable to connect to the Grit API server.';
            setError(msg);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [loadAllData]);

  const activeCategories = useMemo(
    () => categories.filter((cat) => !cat.is_archived),
    [categories],
  );

  const dailyLogsMap = useMemo(
    () => new Map(dailyLogs.map((log) => [log.log_date, log])),
    [dailyLogs],
  );

  const upsertDailyLog = useCallback(
    async (logDate: string, data: DailyLogUpsert) => {
      const saved = await dailyLogsApi.upsert(logDate, data);
      setDailyLogs((prev) => {
        const exists = prev.some((l) => l.log_date === logDate);
        if (exists) {
          return prev.map((l) => (l.log_date === logDate ? saved : l));
        }
        return [saved, ...prev];
      });
      return saved;
    },
    [],
  );

  const deleteDailyLog = useCallback(async (logDate: string) => {
    await dailyLogsApi.delete(logDate);
    setDailyLogs((prev) => prev.filter((l) => l.log_date !== logDate));
  }, []);

  const startOrSwitchSession = useCallback(async (categoryId: number) => {
    setError(null);
    try {
      const started = await sessionsApi.start({ category_id: categoryId });
      setActiveSession(started);
      const updatedSessions = await sessionsApi.getAll({ limit: 2000 });
      setSessions(updatedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session');
    }
  }, []);

  const stopActiveSession = useCallback(async (optionalNote?: string) => {
    setError(null);
    try {
      const stopped = await sessionsApi.stop();
      if (optionalNote && optionalNote.trim()) {
        await sessionsApi.update(stopped.id, { note: optionalNote.trim() });
      }
      setActiveSession(null);
      const updatedSessions = await sessionsApi.getAll({ limit: 2000 });
      setSessions(updatedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop session');
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryCreate) => {
    const created = await categoriesApi.create(data);
    setCategories((prev) =>
      prev.some((cat) => cat.id === created.id)
        ? prev.map((cat) => (cat.id === created.id ? created : cat))
        : [...prev, created],
    );
    return created;
  }, []);

  const updateCategory = useCallback(
    async (id: number, data: CategoryUpdate) => {
      const updated = await categoriesApi.update(id, data);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat)),
      );
      return updated;
    },
    [],
  );

  const archiveCategory = useCallback(
    async (id: number) => {
      const archived = await categoriesApi.archive(id);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? archived : cat)),
      );
      if (activeSession?.category_id === id) {
        setActiveSession(null);
      }
      const updatedSessions = await sessionsApi.getAll({ limit: 2000 });
      setSessions(updatedSessions);
    },
    [activeSession],
  );

  const updateSession = useCallback(async (id: number, data: SessionUpdate) => {
    const updated = await sessionsApi.update(id, data);
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const deleteSession = useCallback(async (id: number) => {
    await sessionsApi.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    categories,
    activeCategories,
    sessions,
    dailyLogs,
    dailyLogsMap,
    activeSession,
    isLocked,
    loading,
    error,
    setError,
    refresh,
    unlock,
    startOrSwitchSession,
    stopActiveSession,
    createCategory,
    updateCategory,
    archiveCategory,
    updateSession,
    deleteSession,
    upsertDailyLog,
    deleteDailyLog,
  };
}
