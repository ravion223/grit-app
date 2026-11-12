import type { PaletteCommand } from '../../utils/commandPalette';

interface CommandResultsListProps {
  commands: PaletteCommand[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onExecute: (cmd: PaletteCommand) => void;
  onRegisterItemRef: (id: string, el: HTMLButtonElement | null) => void;
}

/**
 * Minimal flat list of matching command labels while typing.
 */
export function CommandResultsList({
  commands,
  selectedIndex,
  onSelectIndex,
  onExecute,
  onRegisterItemRef,
}: CommandResultsListProps) {
  if (commands.length === 0) {
    return (
      <div className="px-4 py-5 text-center text-xs text-zinc-500">
        No matching commands
      </div>
    );
  }

  return (
    <div className="max-h-64 space-y-0.5 overflow-y-auto p-1.5">
      {commands.map((cmd, idx) => {
        const isSelected = idx === selectedIndex;

        return (
          <button
            key={cmd.id}
            ref={(el) => onRegisterItemRef(cmd.id, el)}
            type="button"
            onMouseMove={() => {
              if (selectedIndex !== idx) {
                onSelectIndex(idx);
              }
            }}
            onClick={() => onExecute(cmd)}
            className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-white/[0.08] text-zinc-100'
                : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
            }`}
          >
            <span className="truncate">{cmd.label}</span>
          </button>
        );
      })}
    </div>
  );
}
