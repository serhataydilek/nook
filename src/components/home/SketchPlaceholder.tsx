import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import SketchBorder from "../sketch/SketchBorder";
import DoodleIcon from "../sketch/DoodleIcon";

export interface SketchPlaceholderProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

/** A page that is honestly "still being sketched" (pre-feature placeholder). */
export default function SketchPlaceholder({ title, icon, children }: SketchPlaceholderProps) {
  return (
    <SketchBorder className="sketch-radius sketch-shadow mt-4 block bg-card px-6 py-12 text-center">
      <DoodleIcon icon={icon} size={28} className="mx-auto text-muted" />
      <h1 className="mt-3 font-hand text-3xl">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{children}</p>
    </SketchBorder>
  );
}
