"use client";

import { Pencil } from "lucide-react";
import type { SavedItem } from "@/lib/types";
import type { ItemActions } from "../actions";
import DoodleIcon from "../../sketch/DoodleIcon";

function strokePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.01} ${p.y + 0.01}`;
  }
  return `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
}

export default function DrawingCard({ item, actions }: { item: SavedItem; actions: ItemActions }) {
  const w = item.drawW ?? 480;
  const h = item.drawH ?? 300;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => actions.onEditDrawing(item)}
        aria-label="Edit drawing"
        className="absolute left-2 top-2 z-20 text-muted opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        <DoodleIcon icon={Pencil} size={14} strokeWidth={1.8} />
      </button>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="block w-full"
        style={{ aspectRatio: `${w} / ${h}` }}
        role="img"
        aria-label={item.title || "drawing"}
      >
        {(item.strokes ?? []).map((s, i) => (
          <path
            key={i}
            d={strokePath(s.points)}
            fill="none"
            stroke={s.tool === "eraser" ? "var(--color-paper)" : s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
