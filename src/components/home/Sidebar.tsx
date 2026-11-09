"use client";

import { Bookmark, Folder, Home, Settings } from "lucide-react";
import DoodleIcon from "../sketch/DoodleIcon";
import Logo from "../sketch/Logo";
import SketchLine from "../sketch/SketchLine";
import type { View } from "@/lib/types";

const NAV: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "all", label: "Saved", icon: Bookmark },
  { id: "collections", label: "Collections", icon: Folder },
  { id: "settings", label: "Settings", icon: Settings },
];

export interface SidebarProps {
  view: View;
  onChange: (v: View) => void;
}

export default function Sidebar({ view, onChange }: SidebarProps) {
  return (
    <aside className="relative flex items-center gap-3 px-4 py-4 md:w-56 md:shrink-0 md:flex-col md:items-stretch md:gap-2 md:px-7 md:py-8">
      <Logo />
      <nav
        aria-label="Main navigation"
        className="flex gap-1 overflow-x-auto md:mt-5 md:flex-col md:overflow-visible"
      >
        {NAV.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap px-3 py-2 font-hand text-lg transition-transform duration-150 hover:-rotate-1 ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <DoodleIcon icon={item.icon} size={19} />
              <span className={active ? "hatch" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {/* dividers: horizontal on mobile, vertical on desktop */}
      <SketchLine orientation="h" className="bottom-0 left-0 h-[6px] w-full md:hidden" />
      <SketchLine orientation="v" className="right-0 top-0 hidden h-full w-[6px] md:block" />
    </aside>
  );
}
