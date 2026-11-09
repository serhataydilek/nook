"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import SketchBorder from "./SketchBorder";
import DoodleIcon from "./DoodleIcon";

export interface SketchModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const FOCUSABLE =
  "button, [href], input, textarea, select, [tabindex]:not([tabindex='-1'])";

/**
 * Sketch-styled dialog: Esc closes, backdrop click closes, focus is trapped
 * while open and returned to the opener on close.
 */
export default function SketchModal({ open, onClose, title, children }: SketchModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel)?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="animate-fade absolute inset-0 bg-ink/30"
        aria-hidden="true"
        onClick={onClose}
      />
      <SketchBorder
        className="sketch-radius animate-fade-rise sketch-shadow-lg relative z-10 block max-h-[90dvh] w-full max-w-md overflow-y-auto bg-card p-5 sm:p-6"
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className="relative outline-none"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="font-hand text-2xl leading-tight">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="text-muted transition-transform duration-150 hover:-rotate-6 hover:text-ink"
            >
              <DoodleIcon icon={X} size={20} />
            </button>
          </div>
          {children}
        </div>
      </SketchBorder>
    </div>
  );
}
