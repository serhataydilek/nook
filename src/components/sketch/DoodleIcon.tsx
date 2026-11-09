import type { LucideIcon } from "lucide-react";

export interface DoodleIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/**
 * Lucide icon with sketch-style stroke settings (thinner line, round caps,
 * a slight tilt so it feels drawn rather than rendered).
 */
export default function DoodleIcon({
  icon: Icon,
  size = 18,
  strokeWidth = 1.75,
  className = "",
}: DoodleIconProps) {
  return (
    <Icon
      aria-hidden="true"
      size={size}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`-rotate-2 shrink-0 ${className}`}
    />
  );
}
