import { createElement } from 'react';
import { LuZap } from 'react-icons/lu';
import { ICON_MAP } from '../utils/icons';

export function CategoryIcon({
  iconKey,
  className,
}: {
  iconKey?: string | null;
  className?: string;
}) {
  const key = iconKey?.toLowerCase() ?? 'zap';
  const IconComponent = ICON_MAP[key] ?? LuZap;
  return createElement(IconComponent, { className });
}
