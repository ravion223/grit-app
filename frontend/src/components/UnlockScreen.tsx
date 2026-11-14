import { useState, type SubmitEvent } from 'react';
import { LuLock } from 'react-icons/lu';

interface UnlockScreenProps {
  onUnlock: (secretKey: string) => Promise<void>;
}

/**
 * Prompts once per device for the private access key before unlocking the app.
 */
export function UnlockScreen({ onUnlock }: UnlockScreenProps) {
  const [keyInput, setKeyInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onUnlock(keyInput);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to verify access key.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs space-y-4 rounded-2xl border border-white/[0.08] bg-[#151821] p-6 shadow-2xl"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <LuLock className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">grit</h1>
            <p className="text-[11px] text-zinc-500">Private instance</p>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Enter access key"
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/[0.08] bg-[#0e1015] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting || !keyInput.trim()}
          className="w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Unlocking...' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
