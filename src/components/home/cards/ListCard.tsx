"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { ListEntry, SavedItem } from "@/lib/types";
import type { ItemActions } from "../actions";
import DoodleIcon from "../../sketch/DoodleIcon";
import CheckDoodle from "../../sketch/CheckDoodle";

export default function ListCard({ item, actions }: { item: SavedItem; actions: ItemActions }) {
  const [draft, setDraft] = useState("");
  const list = item.list ?? [];

  const update = (next: ListEntry[]) => void actions.updateItem(item.id, { list: next });

  const addEntry = () => {
    const text = draft.trim();
    if (!text) return;
    update([...list, { id: crypto.randomUUID(), text, checked: false }]);
    setDraft("");
  };

  const toggle = (id: string) =>
    update(list.map((e) => (e.id === id ? { ...e, checked: !e.checked } : e)));

  const remove = (id: string) => update(list.filter((e) => e.id !== id));

  return (
    <div data-no-drag>
      {item.title && <h3 className="pr-6 font-hand text-xl leading-snug">{item.title}</h3>}
      <ul className="mt-1 flex flex-col gap-1">
        {list.map((entry) => (
          <li key={entry.id} className="group/li flex items-center gap-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={entry.checked}
              aria-label={`mark “${entry.text}” as ${entry.checked ? "not done" : "done"}`}
              onClick={() => toggle(entry.id)}
              className="grid h-[18px] w-[18px] shrink-0 place-items-center border-[1.5px] border-ink text-ink transition-transform hover:-rotate-6"
            >
              {entry.checked && <CheckDoodle className="h-3.5 w-3.5" />}
            </button>
            <span
              className={`font-hand text-[17px] leading-snug ${
                entry.checked ? "text-muted line-through" : "text-ink/90"
              }`}
            >
              {entry.text}
            </span>
            <button
              type="button"
              onClick={() => remove(entry.id)}
              aria-label={`remove ${entry.text}`}
              className="ml-auto text-muted opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover/li:opacity-100"
            >
              <DoodleIcon icon={X} size={13} strokeWidth={2} />
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center gap-1.5 border-t border-ink/15 pt-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addEntry();
            }
          }}
          placeholder="add an item…"
          aria-label="Add a list item"
          className="w-full bg-transparent font-hand text-[17px] focus:outline-none placeholder:text-muted/60"
        />
        <button
          type="button"
          onClick={addEntry}
          aria-label="Add item"
          className="shrink-0 text-muted transition-transform hover:-rotate-6 hover:text-ink"
        >
          <DoodleIcon icon={Plus} size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
