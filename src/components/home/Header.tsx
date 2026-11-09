"use client";

import { Plus, Search } from "lucide-react";
import Logo from "../sketch/Logo";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import DoodleIcon from "../sketch/DoodleIcon";

export interface HeaderProps {
  query: string;
  onQuery: (q: string) => void;
  onSave: () => void;
}

export default function Header({ query, onQuery, onSave }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Logo />
        <div className="relative order-3 w-full sm:order-none sm:mx-auto sm:w-auto sm:max-w-md sm:flex-1">
          <DoodleIcon
            icon={Search}
            size={17}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted"
          />
          <SketchBorder className="sketch-box block bg-card">
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              aria-label="Search your saved items"
              placeholder="search your nook…"
              className="w-full bg-transparent py-2 pl-9 pr-3 text-[15px] focus:outline-none placeholder:text-muted/70"
            />
          </SketchBorder>
        </div>
        <SketchButton variant="primary" onClick={onSave} className="ml-auto sm:ml-0">
          <DoodleIcon icon={Plus} size={18} strokeWidth={2.2} />
          Save
        </SketchButton>
      </div>
      {/* wobbly divider under the header */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-[6px] w-full text-ink/70"
        viewBox="0 0 100 6"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 3 C 18 1.2, 38 5, 58 3 S 88 1.8, 100 3.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </header>
  );
}
