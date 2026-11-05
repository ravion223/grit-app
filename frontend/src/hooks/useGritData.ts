import { useCallback, useEffect, useState } from 'react';
import { categoriesApi } from '../api/categories';
import { sessionsApi } from '../api/sessions';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  SessionUpdate,
  TimeSession,
} from '../types';

export function useGritData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [catsData, sessionsData, activeData] = await Promise.all([
        categoriesApi.getAll(),
        sessionsApi.getAll({ limit: 100 }),
        sessionsApi.getActive(),
      ]);
      setCategories(catsData);
      setSessions(sessionsData);
      setActiveSession(activeData);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to connect to the Grit API server.';
      setError(msg);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catsData, sessionsData, activeData] = await Promise.all([
          categoriesApi.getAll(),
          sessionsApi.getAll({ limit: 100 }),
          sessionsApi.getActive(),
        ]);
        if (!cancelled) {
          setCategories(catsData);
          setSessions(sessionsData);
          setActiveSession(activeData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Unable to connect to the Grit API server.';
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startOrSwitchSession = useCallback(async (categoryId: number) => {
    setError(null);
    try {
      const started = await sessionsApi.start({ category_id: categoryId });
      setActiveSession(started);
      const updatedSessions = await sessionsApi.getAll({ limit: 100 });
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
      const updatedSessions = await sessionsApi.getAll({ limit: 100 });
      setSessions(updatedSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop session');
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryCreate) => {
    const created = await categoriesApi.create(data);
    setCategories((prev) => [...prev, created]);
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
      await categoriesApi.archive(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      if (activeSession?.category_id === id) {
        setActiveSession(null);
      }
      const updatedSessions = await sessionsApi.getAll({ limit: 100 });
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
    sessions,
    activeSession,
    loading,
    error,
    setError,
    refresh,
    startOrSwitchSession,
    stopActiveSession,
    createCategory,
    updateCategory,
    archiveCategory,
    updateSession,
    deleteSession,
  };
}
