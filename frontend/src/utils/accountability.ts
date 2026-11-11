import type { IconType } from 'react-icons';
import {
  LuCrosshair,
  LuFlame,
  LuFrown,
  LuGauge,
  LuLaugh,
  LuMeh,
  LuShieldOff,
  LuSkull,
  LuSmile,
  LuTarget,
} from 'react-icons/lu';

export interface RatingDescriptor {
  value: number;
  label: string;
  subtitle: string;
  color: string;
  bgColor: string;
  Icon: IconType;
}

export const MOOD_LEVELS: Record<number, RatingDescriptor> = {
  1: {
    value: 1,
    label: 'Broken / Drained',
    subtitle: 'Zero motivation, heavy mental or physical fatigue',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    Icon: LuSkull,
  },
  2: {
    value: 2,
    label: 'Heavy Resistance',
    subtitle: 'Urge to procrastinate or cut corners',
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.15)',
    Icon: LuFrown,
  },
  3: {
    value: 3,
    label: 'Steady / Baseline',
    subtitle: 'Normal energy, showed up without drama',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    Icon: LuMeh,
  },
  4: {
    value: 4,
    label: 'Fired Up',
    subtitle: 'High energy, ready to attack the day',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.15)',
    Icon: LuSmile,
  },
  5: {
    value: 5,
    label: 'Unstoppable',
    subtitle: 'Peak drive, unbreakable momentum',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.15)',
    Icon: LuLaugh,
  },
};

export const FOCUS_LEVELS: Record<number, RatingDescriptor> = {
  1: {
    value: 1,
    label: 'Folded',
    subtitle: 'Gave in to distractions, excuses won',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.15)',
    Icon: LuShieldOff,
  },
  2: {
    value: 2,
    label: '40% Rule',
    subtitle: 'Stopped when discomfort or boredom hit',
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.15)',
    Icon: LuGauge,
  },
  3: {
    value: 3,
    label: 'Did the Duty',
    subtitle: 'Put in honest, solid execution',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.15)',
    Icon: LuTarget,
  },
  4: {
    value: 4,
    label: 'Calloused',
    subtitle: 'Overcame friction and locked in anyway',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.15)',
    Icon: LuCrosshair,
  },
  5: {
    value: 5,
    label: 'Taking Souls',
    subtitle: 'Total immersion, maximum discipline',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.15)',
    Icon: LuFlame,
  },
};

/**
 * Returns true if mood was low (<= 2) but focus was high (>= 4).
 * In Goggins philosophy, pushing hard when feeling like quitting builds a calloused mind.
 */
export function isCallousedMind(
  moodScore: number | null | undefined,
  focusLevel: number | null | undefined,
): boolean {
  if (moodScore === null || moodScore === undefined) return false;
  if (focusLevel === null || focusLevel === undefined) return false;
  return moodScore <= 2 && focusLevel >= 4;
}

export const JOURNAL_PLACEHOLDERS = [
  'What excuse tried to hold you back today? How did you respond?',
  'What did you learn today about your limits? Where did you leave 40% on the table?',
  'What went right, what went wrong, and what is your #1 non-negotiable target for tomorrow?',
  'Be honest with the mirror: Did you give everything, or did you negotiate with yourself?',
];
