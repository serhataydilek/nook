import { useId } from "react";

export interface SketchLineProps {
  orientation?: "h" | "v";
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * A single wobbly hand-drawn divider line (horizontal or vertical),
 * displaced with fractal noise like a fineliner stroke.
 */
export default function SketchLine({
  orientation = "h",
  className = "",
  stroke = "currentColor",
  strokeWidth = 1.6,
}: SketchLineProps) {
  const rawId = useId();
  const id = `ln${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const horizontal = orientation === "h";

  return (
    <svg
      className={`pointer-events-none absolute overflow-visible text-ink/70 ${className}`}
      viewBox={horizontal ? "0 0 100 6" : "0 0 6 100"}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={id} x="-100%" y="-100%" width="300%" height="300%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={horizontal ? "0.02 0.09" : "0.09 0.02"}
            numOctaves="2"
            seed={5}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
      </defs>
      {horizontal ? (
        <path
          d="M0 3 C 15 1.4, 32 4.8, 50 3 S 82 1.6, 100 3.2"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${id})`}
        />
      ) : (
        <path
          d="M3 0 C 1.6 20, 4.4 45, 3 65 S 2.2 88, 3 100"
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${id})`}
        />
      )}
    </svg>
  );
}
