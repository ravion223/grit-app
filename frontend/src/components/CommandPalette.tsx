import { LuSearch } from 'react-icons/lu';
import { CommandResultsList } from './command-palette/CommandResultsList';
import { CommandsGuide } from './command-palette/CommandsGuide';
import {
  useCommandPalette,
  type UseCommandPaletteOptions,
} from './command-palette/useCommandPalette';

export type CommandPaletteProps = UseCommandPaletteOptions;

/**
 * Minimal command palette triggered via Cmd/Ctrl + K or the top-corner button.
 */
export function CommandPalette(props: CommandPaletteProps) {
  const {
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
  } = useCommandPalette(props);

  if (!props.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-3 pt-[16vh] backdrop-blur-xs sm:p-4 sm:pt-[18vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closePalette();
        }
      }}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#141720] shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-3.5 py-3">
          <LuSearch className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        {hasQuery ? (
          <CommandResultsList
            commands={flatCommands}
            selectedIndex={safeSelectedIndex}
            onSelectIndex={setSelectedIndex}
            onExecute={executeCommand}
            onRegisterItemRef={registerItemRef}
          />
        ) : (
          <CommandsGuide />
        )}
      </div>
    </div>
  );
}
