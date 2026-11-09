"use client";

import { useState } from "react";
import type { SavedItem } from "@/lib/types";
import type { ItemActions } from "../actions";
import NoteBody from "./NoteBody";

export default function NoteCard({ item, actions }: { item: SavedItem; actions: ItemActions }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const startEdit = () => {
    setDraft(item.content ?? "");
    setEditing(true);
  };

  const commit = () => {
    if (draft !== (item.content ?? "")) {
      void actions.updateItem(item.id, { content: draft });
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <textarea
        autoFocus
        aria-label="Edit note"
        data-no-drag
        rows={Math.min(Math.max(draft.split("\n").length, 4), 14)}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDraft(item.content ?? "");
            setEditing(false);
          } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            commit();
          }
        }}
        className="note-body w-full resize-none bg-transparent font-hand text-[17px] leading-[1.6] text-ink/90 focus:outline-none"
      />
    );
  }

  return (
    <div
      data-no-drag
      onClick={startEdit}
      className="cursor-text"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") startEdit();
      }}
      aria-label="Edit note"
    >
      {item.title && <h3 className="pr-6 font-hand text-xl leading-snug">{item.title}</h3>}
      {item.content && <NoteBody content={item.content} />}
      {!item.content && (
        <p className="note-body mt-1 font-hand text-[17px] text-muted/70">click to write…</p>
      )}
    </div>
  );
}
