import type { ButtonHTMLAttributes } from "react";
import SketchBorder from "./SketchBorder";

type Variant = "ghost" | "danger";
type Size = "sm" | "md";

export interface SketchButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * A plain ink-outlined button: thin wobbly rectangle, handwritten label,
 * a gentle tilt on hover. No fills, no shadows.
 */
export default function SketchButton({
  variant = "ghost",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}: SketchButtonProps) {
  const sizeCls = size === "sm" ? "px-3 py-1.5 text-base" : "px-4 py-1.5 text-lg";
  const stroke = variant === "danger" ? "var(--color-error)" : "var(--color-ink)";

  return (
    <button
      type={type}
      className={`group/btn relative inline-flex items-center justify-center gap-2 font-hand leading-none transition-transform duration-150 ease-out hover:-translate-y-px hover:-rotate-[0.6deg] active:translate-y-px active:rotate-0 disabled:pointer-events-none disabled:opacity-50 ${sizeCls} ${className}`}
      {...rest}
    >
      <SketchBorder
        stroke={stroke}
        className="pointer-events-none inset-0"
        style={{ position: "absolute" }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
