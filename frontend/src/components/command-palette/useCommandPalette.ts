import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPaletteCommands,
  type BuildCommandsInput,
  filterAndRankCommands,
  type PaletteCommand,
} from '../../utils/commandPalette';

export interface UseCommandPaletteOptions extends BuildCommandsInput {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Manages command palette state, global shortcuts, filtering, and keyboard navigation.
 */
export function useCommandPalette({
  isOpen,
  onOpen,
  onClose,
  categories,
  sessions,
  activeSession,
  activeCategory,
  onStartOrSwitch,
  onStop,
  onOpenShutdown,
  onOpenCookieJar,
  onNewCategory,
  onEditCategory,
  onArchiveCategory,
}: UseCommandPaletteOptions) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isOpenRef = useRef(isOpen);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const closePalette = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    onCloseRef.current();
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey;
      const isK = e.key.toLowerCase() === 'k' || e.code === 'KeyK';

      if (isCmdOrCtrl && isK) {
        e.preventDefault();
        e.stopPropagation();
        setQuery('');
        setSelectedIndex(0);

        if (isOpenRef.current) {
          onCloseRef.current();
        } else {
          onOpenRef.current();
        }
      } else if (e.key === 'Escape' && isOpenRef.current) {
        e.preventDefault();
        e.stopPropagation();
        setQuery('');
        setSelectedIndex(0);
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    return () =>
      window.removeEventListener('keydown', handleGlobalKeyDown, {
        capture: true,
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const allCommands = useMemo(
    () =>
      buildPaletteCommands({
        categories,
        sessions,
        activeSession,
        activeCategory,
        onStartOrSwitch,
        onStop,
        onOpenShutdown,
        onOpenCookieJar,
        onNewCategory,
        onEditCategory,
        onArchiveCategory,
      }),
    [
      categories,
      sessions,
      activeSession,
      activeCategory,
      onStartOrSwitch,
      onStop,
      onOpenShutdown,
      onOpenCookieJar,
      onNewCategory,
      onEditCategory,
      onArchiveCategory,
    ],
  );

  const hasQuery = query.trim().length > 0;

  const flatCommands = useMemo(
    () => (hasQuery ? filterAndRankCommands(allCommands, query) : []),
    [allCommands, hasQuery, query],
  );

  const safeSelectedIndex =
    flatCommands.length === 0
      ? 0
      : Math.min(selectedIndex, flatCommands.length - 1);

  const selectedCommand = flatCommands[safeSelectedIndex];

  useEffect(() => {
    if (!isOpen || !selectedCommand) return;
    itemRefs.current
      .get(selectedCommand.id)
      ?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, selectedCommand]);

  const registerItemRef = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) {
        itemRefs.current.set(id, el);
      } else {
        itemRefs.current.delete(id);
      }
    },
    [],
  );

  const handleQueryChange = (nextQuery: string) => {
    setQuery(nextQuery);
    setSelectedIndex(0);
  };

  const executeCommand = (cmd: PaletteCommand) => {
    closePalette();
    void cmd.onSelect();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatCommands.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flatCommands.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatCommands.length > 0) {
        setSelectedIndex(
          (prev) => (prev - 1 + flatCommands.length) % flatCommands.length,
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedCommand) {
        executeCommand(selectedCommand);
      }
    }
  };

  return {
    query,
    hasQuery,
    handleQueryChange,
    safeSelectedIndex,
    setSelectedIndex,
    flatCommands,
    inputRef,
    registerItemRef,
    closePalette,
    executeCommand,
    handleInputKeyDown,
  };
}
