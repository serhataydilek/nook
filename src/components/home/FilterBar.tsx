"use client";

import type { Filter, ItemType, SavedItem } from "@/lib/types";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "link", label: "Links" },
  { id: "image", label: "Images" },
  { id: "note", label: "Notes" },
];

export interface FilterBarProps {
  filter: Filter;
  onChange: (f: Filter) => void;
  items: SavedItem[];
}

function countFor(filter: Filter, items: SavedItem[]): number {
  if (filter === "all") return items.length;
  return items.filter((it) => it.type === (filter as ItemType)).length;
}

export default function FilterBar({ filter, onChange, items }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1" role="group" aria-label="Filter saved items by type">
      {FILTERS.map((f) => {
        const active = filter === f.id;
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f.id)}
            className={`font-hand text-lg transition-transform duration-150 hover:-rotate-1 ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <span className={active ? "highlighter" : ""}>{f.label}</span>
            <span className="ml-1 align-super font-sans text-xs text-muted">
              {countFor(f.id, items)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
