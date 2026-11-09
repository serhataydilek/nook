"use client";

import { Bookmark, Folder, Home, Settings } from "lucide-react";
import DoodleIcon from "../sketch/DoodleIcon";
import type { View } from "@/lib/types";

const NAV: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "all", label: "All saved", icon: Bookmark },
  { id: "collections", label: "Collections", icon: Folder },
  { id: "settings", label: "Settings", icon: Settings },
];

export interface SidebarProps {
  view: View;
  onChange: (v: View) => void;
}

export default function Sidebar({ view, onChange }: SidebarProps) {
  return (
    <aside className="shrink-0 md:w-44 lg:w-52">
      <nav
        aria-label="Main navigation"
        className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:sticky md:top-24 md:mx-0 md:flex-col md:overflow-visible md:px-0"
      >
        {NAV.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 px-3 py-2 font-hand text-lg transition-transform duration-150 hover:-rotate-1 ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <DoodleIcon icon={item.icon} size={18} />
              <span className={active ? "highlighter" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
