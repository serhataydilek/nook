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
    <aside className="relative flex h-16 shrink-0 items-center gap-4 px-5 md:h-auto md:w-[264px] md:flex-col md:items-stretch md:gap-0 md:px-8 md:py-9">
      <Logo />
      <nav
        aria-label="Main navigation"
        className="flex gap-1 overflow-x-auto md:mt-12 md:flex-col md:overflow-visible"
      >
        {NAV.map((item) => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 whitespace-nowrap px-3 py-2.5 font-hand text-xl transition-transform duration-150 hover:-rotate-[0.6deg] ${
                active ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <DoodleIcon icon={item.icon} size={20} strokeWidth={1.6} />
              <span className={active ? "hatch" : ""}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {/* dividers: horizontal on mobile, vertical on desktop */}
      <SketchLine orientation="h" strokeWidth={1.8} className="bottom-0 left-0 h-[5px] w-full md:hidden" />
      <SketchLine orientation="v" strokeWidth={1.8} className="right-0 top-0 hidden h-full w-[5px] md:block" />
    </aside>
  );
}
