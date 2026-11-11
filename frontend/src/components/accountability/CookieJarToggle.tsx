import { LuCookie } from 'react-icons/lu';

interface CookieJarToggleProps {
  isCookieJar: boolean;
  onToggle: () => void;
}

export function CookieJarToggle({
  isCookieJar,
  onToggle,
}: CookieJarToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition ${
            isCookieJar
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-white/[0.04] text-zinc-500'
          }`}
        >
          <LuCookie className="h-4 w-4" />
        </div>
        <div>
          <label
            htmlFor="cookie-jar-toggle"
            className="text-xs font-semibold text-zinc-200 cursor-pointer"
          >
            Add to the Cookie Jar
          </label>
          <p className="text-[11px] text-zinc-400">
            Save today as a reminder of what you conquered when future quitting
            thoughts arrive.
          </p>
        </div>
      </div>

      <button
        id="cookie-jar-toggle"
        type="button"
        role="switch"
        aria-checked={isCookieJar}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isCookieJar ? 'bg-amber-500' : 'bg-white/[0.12]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            isCookieJar ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
