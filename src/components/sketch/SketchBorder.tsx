import { useId, type CSSProperties, type ReactNode } from "react";

export interface SketchBorderProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  role?: string;
  stroke?: string;
  strokeWidth?: number;
  double?: boolean;
  dash?: boolean;
  seedKey?: string | number;
  radius?: number;
}

/** Continuous, slightly uneven pen strokes; each border has its own steady wobble. */
export default function SketchBorder({
  children,
  className = "",
  style,
  stroke = "currentColor",
  strokeWidth = 1.5,
  double = false,
  dash = false,
  seedKey,
  role,
  radius = 4,
}: SketchBorderProps) {
  const rawId = useId();
  const src = String(seedKey ?? rawId);
  let seed = 7;
  for (let i = 0; i < src.length; i++) seed = (seed * 31 + src.charCodeAt(i)) % 997;

  const wobble = 2 + (seed % 7);
  const r = radius * 10;
  const path = `M ${8 + r} 9
    C 235 ${7 - wobble} 363 ${12 + wobble} 505 8
    S 782 ${10 - wobble} ${992 - r} 9
    Q 994 8 992 ${9 + r}
    C ${993 + wobble * 0.15} 232 ${991 - wobble * 0.15} 362 992 510
    S ${992 + wobble * 0.15} 772 992 ${991 - r}
    Q 994 993 ${992 - r} 991
    C 778 ${994 + wobble} 633 ${987 - wobble} 490 991
    S 222 ${989 + wobble} ${8 + r} 991
    Q 6 994 8 ${991 - r}
    C ${7 - wobble * 0.15} 768 ${9 + wobble * 0.15} 633 8 490
    S ${8 - wobble * 0.15} 224 8 ${9 + r}
    Q 6 8 ${8 + r} 9 Z`;

  return (
    <span className={`relative ${className}`} style={style} role={role}>
      {children}
      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dash ? "7 6" : undefined}
          vectorEffect="non-scaling-stroke"
        />
        {!dash && (
          <path
            d={path}
            transform={double ? "translate(1.3 -0.8)" : "translate(0.7 1.1)"}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.55}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={double ? 0.4 : 0.24}
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </span>
  );
}
