"use client";

import { useRef } from "react";
import { Image as ImageIcon, ListPlus, NotebookPen, Pencil } from "lucide-react";
import SketchBorder from "../sketch/SketchBorder";
import DoodleIcon from "../sketch/DoodleIcon";

export interface ToolbarProps {
  onNote: () => void;
  onList: () => void;
  onDraw: () => void;
  onImageFiles: (files: File[]) => void;
}

/** Small unobtrusive tool pill floating at the bottom of the workspace. */
export default function Toolbar({ onNote, onList, onDraw, onImageFiles }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const btn =
    "grid h-9 w-9 place-items-center text-ink transition-transform duration-150 hover:-translate-y-0.5 hover:-rotate-6";

  return (
    <div className="workspace-toolbar">
      <SketchBorder seedKey="toolbar" radius={0.5} className="flex items-center gap-0.5 bg-card px-1.5 py-1">
        <button type="button" className={btn} onClick={onNote} aria-label="Write a note" title="Note">
          <DoodleIcon icon={NotebookPen} size={19} />
        </button>
        <button type="button" className={btn} onClick={onList} aria-label="New checklist" title="List">
          <DoodleIcon icon={ListPlus} size={19} />
        </button>
        <button type="button" className={btn} onClick={onDraw} aria-label="Draw something" title="Draw">
          <DoodleIcon icon={Pencil} size={19} />
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => fileRef.current?.click()}
          aria-label="Add an image"
          title="Image"
        >
          <DoodleIcon icon={ImageIcon} size={19} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onImageFiles(files);
            e.target.value = "";
          }}
        />
      </SketchBorder>
    </div>
  );
}
