import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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
import { parseBackendDate } from '../utils/time';

function finishSessionLocally(
  session: TimeSession,
  endTimeIso: string,
  note?: string,
): TimeSession {
  const startMs = parseBackendDate(session.start_time).getTime();
  const endMs = Date.parse(endTimeIso);
  const durationSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));

  return {
    ...session,
    end_time: endTimeIso,
    duration_seconds: durationSeconds,
    note: note?.trim() ? note.trim() : session.note,
  };
}

function upsertSession(
  list: TimeSession[],
  item: TimeSession,
  replaceId = item.id,
): TimeSession[] {
  const exists = list.some((s) => s.id === replaceId);
  return exists
    ? list.map((s) => (s.id === replaceId ? item : s))
    : [item, ...list];
}

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

  const mutationSeqRef = useRef(0);

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

  const startOrSwitchSession = useCallback(
    async (categoryId: number) => {
      setError(null);
      const prevActive = activeSession;
      const prevSessions = sessions;
      const reqId = ++mutationSeqRef.current;
      try {
        const tempId = -Date.now();
        const nowIso = new Date().toISOString();
        const optimisticActive: TimeSession = {
          id: tempId,
          category_id: categoryId,
          start_time: nowIso,
          end_time: null,
          duration_seconds: null,
          note: null,
        };

        if (prevActive) {
          setSessions((prev) =>
            upsertSession(prev, finishSessionLocally(prevActive, nowIso)),
          );
        }
        setActiveSession(optimisticActive);
        const started = await sessionsApi.start({ category_id: categoryId });
        if (reqId !== mutationSeqRef.current) return;
        setActiveSession(started);

        if (prevActive) {
          const updatedSessions = await sessionsApi.getAll({ limit: 2000 });
          if (reqId !== mutationSeqRef.current) return;
          setSessions(updatedSessions);
        }
      } catch (err) {
        if (reqId !== mutationSeqRef.current) return;
        setActiveSession(prevActive);
        setSessions(prevSessions);
        setError(
          err instanceof Error ? err.message : 'Failed to start session',
        );
      }
    },
    [activeSession, sessions],
  );

  const stopActiveSession = useCallback(
    async (optionalNote?: string) => {
      setError(null);
      if (!activeSession) return;
      const prevActive = activeSession;
      const prevSessions = sessions;
      const reqId = ++mutationSeqRef.current;
      try {
        const nowIso = new Date().toISOString();
        const optimisticStopped = finishSessionLocally(
          prevActive,
          nowIso,
          optionalNote,
        );
        setActiveSession(null);
        setSessions((prev) => upsertSession(prev, optimisticStopped));
        let stopped = await sessionsApi.stop();
        if (optionalNote && optionalNote.trim()) {
          stopped = await sessionsApi.update(stopped.id, {
            note: optionalNote.trim(),
          });
        }
        if (reqId !== mutationSeqRef.current) return;
        setActiveSession(null);
        setSessions((prev) => upsertSession(prev, stopped, prevActive.id));
      } catch (err) {
        if (reqId !== mutationSeqRef.current) return;
        setActiveSession(prevActive);
        setSessions(prevSessions);
        setError(err instanceof Error ? err.message : 'Failed to stop session');
      }
    },
    [activeSession, sessions],
  );

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
