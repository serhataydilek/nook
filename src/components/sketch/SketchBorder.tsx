import { useId, type CSSProperties, type ReactNode } from "react";

export interface SketchBorderProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  role?: string;
  /** stroke color; defaults to the inherited text color */
  stroke?: string;
  strokeWidth?: number;
  /** draw a second, fainter offset line — like going over a stroke twice */
  double?: boolean;
  /** dashed stroke, like a cut-here line */
  dash?: boolean;
  /** vary the wobble per instance */
  seedKey?: string | number;
}

/**
 * Wraps content in a hand-drawn "fineliner" border: an SVG rect whose stroke
 * is displaced by fractal noise so the line wobbles like a real pen stroke.
 */
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
}: SketchBorderProps) {
  // steady-hand wobble: long, gentle waves, tiny displacement
  const BASE_FREQ = "0.008 0.02";
  const SCALE = 1.4;
  const rawId = useId();
  const id = `sk${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const src = String(seedKey ?? rawId);
  let seed = 7;
  for (let i = 0; i < src.length; i++) {
    seed = (seed * 31 + src.charCodeAt(i)) % 997;
  }

  return (
    <span className={`relative ${className}`} style={style} role={role}>
      {children}
      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={BASE_FREQ}
              numOctaves="2"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          {double && (
            <filter id={`${id}b`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.012 0.03"
                numOctaves="2"
                seed={seed + 13}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={SCALE * 0.8}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          )}
        </defs>
        <rect
          x="1.2"
          y="1.6"
          width="97.6"
          height="96.8"
          rx="4"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dash ? "7 6" : undefined}
          vectorEffect="non-scaling-stroke"
          filter={`url(#${id})`}
        />
        {double && (
          <rect
            x="2.6"
            y="3"
            width="94.8"
            height="94"
            rx="4"
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth * 0.7}
            opacity="0.35"
            vectorEffect="non-scaling-stroke"
            filter={`url(#${id}b)`}
          />
        )}
      </svg>
    </span>
  );
}
