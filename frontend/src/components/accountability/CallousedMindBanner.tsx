import { LuFlame } from 'react-icons/lu';

export function CallousedMindBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-200">
      <LuFlame className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-100">Calloused Mind Moment</p>
        <p className="mt-0.5 text-[11px] text-amber-200/80">
          You felt heavy internal resistance today and executed anyway. That is
          the definition of callousing the mind.
        </p>
      </div>
    </div>
  );
}
