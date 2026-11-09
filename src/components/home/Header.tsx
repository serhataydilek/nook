"use client";

import { Search } from "lucide-react";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import SketchLine from "../sketch/SketchLine";
import DoodleIcon from "../sketch/DoodleIcon";

export interface HeaderProps {
  query: string;
  onQuery: (q: string) => void;
  onSave: () => void;
}

export default function Header({ query, onQuery, onSave }: HeaderProps) {
  return (
    <header className="relative flex h-[72px] shrink-0 items-center gap-4 px-5 sm:px-8 lg:px-20">
      <div className="relative w-full max-w-[820px]">
        <DoodleIcon
          icon={Search}
          size={17}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted"
        />
        <SketchBorder className="sketch-box block">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Search your nook"
            placeholder="Search your nook…"
            className="w-full bg-transparent py-2 pl-9 pr-3 text-[15px] focus:outline-none placeholder:text-muted/70"
          />
        </SketchBorder>
      </div>
      <div className="ml-auto shrink-0">
        <SketchButton variant="ghost" onClick={onSave} className="px-5 text-xl">
          Save
          {/* little "new!" sparkle */}
          <svg
            className="absolute -right-1 -top-2 h-4 w-4 text-ink"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 0.5 V4.5 M13.6 2.4 L10.9 5.1 M15.5 8 H11.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </SketchButton>
      </div>
      <SketchLine orientation="h" strokeWidth={1.8} className="bottom-0 left-0 h-[5px] w-full" />
    </header>
  );
}
