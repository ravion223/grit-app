interface GuideRow {
  keywords: string[];
  arg?: string;
  action: string;
}

const GUIDE_ROWS: GuideRow[] = [
  {
    keywords: ['switch', 'grind'],
    arg: '<cat>',
    action: 'Start or switch',
  },
  {
    keywords: ['pause', 'stop', 'end'],
    action: 'Stop active timer',
  },
  {
    keywords: ['resume', 'last'],
    action: 'Resume last session',
  },
  {
    keywords: ['shutdown', 'mirror'],
    action: 'Accountability Mirror',
  },
  {
    keywords: ['cookie', 'cookie jar', 'pull cookie'],
    action: 'Cookie Jar',
  },
  {
    keywords: ['new', 'create'],
    action: 'Create category',
  },
  {
    keywords: ['edit', 'update'],
    arg: '<cat>',
    action: 'Edit category',
  },
  {
    keywords: ['archive', 'delete'],
    arg: '<cat>',
    action: 'Archive category',
  },
];

/**
 * Structured two-column reference guide displayed when the command input is empty.
 */
export function CommandsGuide() {
  return (
    <div className="divide-y divide-white/[0.04] px-4 py-2">
      {GUIDE_ROWS.map((row) => (
        <div
          key={row.action}
          className="flex items-baseline justify-between gap-4 py-1.5"
        >
          <div className="flex flex-wrap items-baseline gap-1 font-mono text-xs">
            {row.keywords.map((kw, idx) => (
              <span key={kw} className="inline-flex items-baseline gap-1">
                {idx > 0 && <span className="text-zinc-600">/</span>}
                <span className="text-zinc-200">{kw}</span>
              </span>
            ))}
            {row.arg && (
              <span className="ml-0.5 text-[11px] italic text-zinc-500">
                {row.arg}
              </span>
            )}
          </div>

          <span className="shrink-0 text-[11px] text-zinc-500">
            {row.action}
          </span>
        </div>
      ))}
    </div>
  );
}
