export interface SketchLineProps {
  orientation?: "h" | "v";
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** A gently wandering pen line, with a faint second pass for uneven ink weight. */
export default function SketchLine({
  orientation = "h",
  className = "",
  stroke = "currentColor",
  strokeWidth = 1.6,
}: SketchLineProps) {
  const horizontal = orientation === "h";
  const path = horizontal
    ? "M0 3 C73 1.1 145 4.8 218 3.1 S350 1.4 430 3.2 S567 4.8 650 2.7 S802 1.2 871 3.1 S951 4.6 1000 2.4"
    : "M3 0 C1.1 73 4.8 145 3.1 218 S1.4 350 3.2 430 S4.8 567 2.7 650 S1.2 802 3.1 871 S4.6 951 2.4 1000";

  return (
    <svg
      className={`pointer-events-none absolute overflow-visible text-ink ${className}`}
      viewBox={horizontal ? "0 0 1000 6" : "0 0 6 1000"}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path d={path} transform={horizontal ? "translate(0 .5)" : "translate(.5 0)"} fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity="0.28" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
