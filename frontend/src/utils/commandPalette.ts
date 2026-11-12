import type { Category, TimeSession } from '../types';

export type CommandKind =
  | 'stop-timer'
  | 'resume-timer'
  | 'start-category'
  | 'open-shutdown'
  | 'open-cookie-jar'
  | 'new-category'
  | 'edit-category'
  | 'archive-category';

export interface PaletteCommand {
  id: string;
  kind: CommandKind;
  label: string;
  category?: Category;
  keywords: string[];
  onSelect: () => void | Promise<void>;
}

export interface BuildCommandsInput {
  categories: Category[];
  sessions: TimeSession[];
  activeSession: TimeSession | null;
  activeCategory: Category | undefined;
  onStartOrSwitch: (categoryId: number) => Promise<void>;
  onStop: () => Promise<void>;
  onOpenShutdown: () => void;
  onOpenCookieJar: () => void;
  onNewCategory: () => void;
  onEditCategory: (category: Category) => void;
  onArchiveCategory: (category: Category) => void;
}

export function buildPaletteCommands({
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
}: BuildCommandsInput): PaletteCommand[] {
  const commands: PaletteCommand[] = [];

  // 1. Pause / Stop active session
  if (activeSession && activeCategory) {
    commands.push({
      id: 'stop-timer',
      kind: 'stop-timer',
      label: `Pause / Stop ${activeCategory.name}`,
      category: activeCategory,
      keywords: ['pause', 'stop', 'end', activeCategory.name.toLowerCase()],
      onSelect: () => onStop(),
    });
  }

  // 2. Resume last session (when idle)
  if (!activeSession && sessions.length > 0) {
    const lastCompleted = sessions.find((s) => s.end_time !== null);
    const lastCategory = lastCompleted
      ? categories.find((c) => c.id === lastCompleted.category_id)
      : undefined;

    if (lastCategory) {
      commands.push({
        id: `resume-timer-${lastCategory.id}`,
        kind: 'resume-timer',
        label: `Resume ${lastCategory.name}`,
        category: lastCategory,
        keywords: ['resume', 'last', lastCategory.name.toLowerCase()],
        onSelect: () => onStartOrSwitch(lastCategory.id),
      });
    }
  }

  // 3. Start / Switch to each category
  const isSwitch = activeSession !== null;
  for (const cat of categories) {
    if (activeSession?.category_id === cat.id) continue;

    commands.push({
      id: `start-cat-${cat.id}`,
      kind: 'start-category',
      label: `${isSwitch ? 'Switch to' : 'Start'} ${cat.name}`,
      category: cat,
      keywords: ['switch', 'grind', cat.name.toLowerCase()],
      onSelect: () => onStartOrSwitch(cat.id),
    });
  }

  // 4. Rituals
  commands.push({
    id: 'open-shutdown',
    kind: 'open-shutdown',
    label: 'Accountability Mirror',
    keywords: ['shutdown', 'mirror'],
    onSelect: onOpenShutdown,
  });

  commands.push({
    id: 'open-cookie-jar',
    kind: 'open-cookie-jar',
    label: 'Open Cookie Jar',
    keywords: ['cookie', 'cookie jar', 'pull cookie'],
    onSelect: onOpenCookieJar,
  });

  // 5. Category Management
  commands.push({
    id: 'new-category',
    kind: 'new-category',
    label: 'Create New Category',
    keywords: ['new', 'create'],
    onSelect: onNewCategory,
  });

  for (const cat of categories) {
    commands.push({
      id: `edit-cat-${cat.id}`,
      kind: 'edit-category',
      label: `Edit ${cat.name}`,
      category: cat,
      keywords: ['edit', 'update', cat.name.toLowerCase()],
      onSelect: () => onEditCategory(cat),
    });

    commands.push({
      id: `archive-cat-${cat.id}`,
      kind: 'archive-category',
      label: `Archive ${cat.name}`,
      category: cat,
      keywords: ['archive', 'delete', cat.name.toLowerCase()],
      onSelect: () => onArchiveCategory(cat),
    });
  }

  return commands;
}

interface IntentMatch {
  kinds: CommandKind[];
  remainder: string;
}

function parseIntentPrefix(query: string): IntentMatch | null {
  const patterns: Array<{ regex: RegExp; kinds: CommandKind[] }> = [
    {
      regex: /^(?:switch|grind)\b\s*(.*)$/i,
      kinds: ['start-category'],
    },
    {
      regex: /^(?:pause|stop|end)\b\s*(.*)$/i,
      kinds: ['stop-timer'],
    },
    {
      regex: /^(?:resume|last)\b\s*(.*)$/i,
      kinds: ['resume-timer'],
    },
    {
      regex: /^(?:edit|update)\b\s*(.*)$/i,
      kinds: ['edit-category'],
    },
    {
      regex: /^(?:archive|delete)\b\s*(.*)$/i,
      kinds: ['archive-category'],
    },
    {
      regex: /^(?:new|create)\b\s*(.*)$/i,
      kinds: ['new-category'],
    },
  ];

  for (const { regex, kinds } of patterns) {
    const match = query.match(regex);
    if (match) {
      return {
        kinds,
        remainder: (match[1] ?? '').trim().toLowerCase(),
      };
    }
  }

  return null;
}

function isSubsequence(needle: string, haystack: string): boolean {
  if (needle.length < 2 || needle.length > haystack.length) return false;
  let nIdx = 0;
  let firstMatch = -1;
  let lastMatch = -1;

  for (let hIdx = 0; hIdx < haystack.length && nIdx < needle.length; hIdx++) {
    if (haystack[hIdx] === needle[nIdx]) {
      if (firstMatch === -1) firstMatch = hIdx;
      lastMatch = hIdx;
      nIdx++;
    }
  }

  if (nIdx < needle.length) return false;
  return lastMatch - firstMatch <= needle.length * 3;
}

function scoreString(target: string, query: string): number {
  const t = target.toLowerCase();
  if (!query) return 1;
  if (t === query) return 100;
  if (t.startsWith(query)) return 85;

  const words = t.split(/[\s\-_/]+/);
  if (words.some((w) => w === query)) return 80;
  if (words.some((w) => w.startsWith(query))) return 75;
  if (t.includes(query)) return 60;
  if (isSubsequence(query, t)) return 35;

  return 0;
}

export function filterAndRankCommands(
  commands: PaletteCommand[],
  rawQuery: string,
): PaletteCommand[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return [];
  }

  const intent = parseIntentPrefix(query);

  if (intent) {
    const candidates = commands.filter((c) => intent.kinds.includes(c.kind));
    if (!intent.remainder) {
      return candidates;
    }

    const scored = candidates
      .map((cmd) => {
        const primaryTarget = cmd.category?.name ?? cmd.label;
        const score = Math.max(
          scoreString(primaryTarget, intent.remainder),
          scoreString(cmd.label, intent.remainder),
        );
        return { cmd, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((item) => item.cmd);
  }

  // General query matching across label, category name, and keywords
  const scored = commands
    .map((cmd) => {
      let best = scoreString(cmd.label, query);
      if (cmd.category) {
        best = Math.max(best, scoreString(cmd.category.name, query));
      }
      for (const kw of cmd.keywords) {
        best = Math.max(best, scoreString(kw, query));
      }

      if (best > 0 && cmd.kind === 'start-category') {
        best += 5;
      } else if (best > 0 && cmd.kind === 'stop-timer') {
        best += 4;
      }

      return { cmd, score: best };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map((item) => item.cmd);
}
