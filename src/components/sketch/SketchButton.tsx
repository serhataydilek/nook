import type { ButtonHTMLAttributes } from "react";
import SketchBorder from "./SketchBorder";

type Variant = "primary" | "ghost" | "card" | "danger";
type Size = "sm" | "md";

export interface SketchButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const FILL: Record<Variant, string> = {
  primary: "var(--color-accent)",
  ghost: "transparent",
  card: "var(--color-card)",
  danger: "transparent",
};

/**
 * A paper-scrap button: wobbly ink border that tilts gently on hover,
 * like a cut-out you nudged with your finger.
 */
export default function SketchButton({
  variant = "ghost",
  size = "md",
  className = "",
  style,
  children,
  type = "button",
  ...rest
}: SketchButtonProps) {
  const sizeCls = size === "sm" ? "px-3 py-1.5 text-base" : "px-4 py-2 text-lg";
  const shadowCls = variant === "primary" || variant === "card" ? "sketch-shadow" : "";
  const stroke = variant === "danger" ? "var(--color-error)" : "var(--color-ink)";

  return (
    <button
      type={type}
      className={`group/btn relative inline-flex items-center justify-center gap-2 font-hand leading-none transition-all duration-200 ease-out hover:-translate-y-[1px] hover:-rotate-1 active:translate-y-[1px] active:rotate-0 disabled:pointer-events-none disabled:opacity-50 ${sizeCls} ${shadowCls} ${className}`}
      style={{ background: FILL[variant], ...style }}
      {...rest}
    >
      <SketchBorder
        stroke={stroke}
        double={variant === "primary"}
        className="pointer-events-none absolute inset-0"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
