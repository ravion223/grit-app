import type { IconType } from 'react-icons';
import {
  LuBookOpen,
  LuBriefcase,
  LuCode,
  LuCoffee,
  LuCpu,
  LuDumbbell,
  LuFlame,
  LuGlobe,
  LuGraduationCap,
  LuHeart,
  LuLayers,
  LuLightbulb,
  LuMusic,
  LuPalette,
  LuPenTool,
  LuRocket,
  LuSparkles,
  LuTarget,
  LuTerminal,
  LuZap,
} from 'react-icons/lu';

export interface IconOption {
  key: string;
  label: string;
  Icon: IconType;
}

export const CATEGORY_ICONS: IconOption[] = [
  { key: 'zap', label: 'Energy / Zap', Icon: LuZap },
  { key: 'code', label: 'Coding', Icon: LuCode },
  { key: 'terminal', label: 'Terminal', Icon: LuTerminal },
  { key: 'book', label: 'Reading / Study', Icon: LuBookOpen },
  { key: 'graduation', label: 'Learning', Icon: LuGraduationCap },
  { key: 'briefcase', label: 'Deep Work', Icon: LuBriefcase },
  { key: 'pen', label: 'Writing', Icon: LuPenTool },
  { key: 'palette', label: 'Design', Icon: LuPalette },
  { key: 'dumbbell', label: 'Fitness', Icon: LuDumbbell },
  { key: 'target', label: 'Focus Goal', Icon: LuTarget },
  { key: 'rocket', label: 'Side Project', Icon: LuRocket },
  { key: 'cpu', label: 'Engineering', Icon: LuCpu },
  { key: 'music', label: 'Music / Audio', Icon: LuMusic },
  { key: 'lightbulb', label: 'Brainstorm', Icon: LuLightbulb },
  { key: 'layers', label: 'Architecture', Icon: LuLayers },
  { key: 'globe', label: 'Languages', Icon: LuGlobe },
  { key: 'heart', label: 'Mindfulness', Icon: LuHeart },
  { key: 'coffee', label: 'Planning', Icon: LuCoffee },
  { key: 'flame', label: 'Streak / Grind', Icon: LuFlame },
  { key: 'sparkles', label: 'Creative', Icon: LuSparkles },
];

export const ICON_MAP: Record<string, IconType> = Object.fromEntries(
  CATEGORY_ICONS.map((item) => [item.key, item.Icon]),
);

export interface ColorSwatch {
  name: string;
  hex: string;
}

export const CATEGORY_COLORS: ColorSwatch[] = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Sky', hex: '#38BDF8' },
  { name: 'Violet', hex: '#A855F7' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Coral', hex: '#FB7185' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Lime', hex: '#84CC16' },
  { name: 'Slate', hex: '#94A3B8' },
];
