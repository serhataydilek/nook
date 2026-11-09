import { Plus } from "lucide-react";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import DoodleIcon from "../sketch/DoodleIcon";

export interface EmptyStateProps {
  onSave: () => void;
}

/**
 * The "unfinished notebook page" shown when the desk is empty.
 * Single thin border, faint ruled lines, no extra decoration.
 */
export default function EmptyState({ onSave }: EmptyStateProps) {
  return (
    <SketchBorder className="notebook-lines mt-8 block px-6 py-14 text-center sm:px-16">
      {/* an unfinished scribble, as if the pen stopped mid-line */}
      <svg
        viewBox="0 0 220 24"
        className="mx-auto h-5 w-44 text-ink/60"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 16 C 30 6, 48 22, 74 12 S 118 6, 142 14 S 190 20, 214 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <h2 className="mt-4 font-hand text-3xl">your desk is empty…</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        paste a link, drop an image, or type a note — it lands right here on your desk.
        organize later, if ever.
      </p>
      <SketchButton variant="ghost" onClick={onSave} className="mt-6">
        <DoodleIcon icon={Plus} size={17} strokeWidth={2} />
        save something
      </SketchButton>
    </SketchBorder>
  );
}
