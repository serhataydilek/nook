"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, FolderPlus, Maximize2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { SavedItem } from "@/lib/types";
import type { ItemActions } from "./actions";
import SketchBorder from "../sketch/SketchBorder";
import DoodleIcon from "../sketch/DoodleIcon";

export default function CardMenu({ item, actions }: { item: SavedItem; actions: ItemActions }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const createCollection = async () => {
    const name = newName.trim();
    if (!name) return;
    const c = await actions.onCreateCollection(name);
    await actions.onToggleCollection(item.id, c.id);
    setNewName("");
  };

  const menuBtn =
    "flex w-full items-center gap-2 px-2 py-1.5 text-left font-hand text-base text-ink transition-transform duration-150 hover:-rotate-[0.4deg]";

  return (
    <div ref={rootRef} className="absolute right-2 top-2 z-20" data-no-drag>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Actions for ${item.title || item.type}`}
        aria-expanded={open}
        className="delete-item grid min-h-[30px] min-w-[30px] place-items-center text-muted opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        <DoodleIcon icon={MoreVertical} size={17} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 min-w-[220px]">
          <SketchBorder seedKey={`menu-${item.id}`} radius={0.5} className="block bg-card p-1.5">
            {item.type === "link" && item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={menuBtn}>
                <DoodleIcon icon={ExternalLink} size={15} /> open link
              </a>
            )}
            {item.type === "image" && (
              <button type="button" className={menuBtn} onClick={() => { actions.onOpenImage(item); setOpen(false); }}>
                <DoodleIcon icon={Maximize2} size={15} /> view full size
              </button>
            )}
            {item.type === "drawing" && (
              <button type="button" className={menuBtn} onClick={() => { actions.onEditDrawing(item); setOpen(false); }}>
                <DoodleIcon icon={Pencil} size={15} /> edit drawing
              </button>
            )}
            <div className="my-1 border-t border-ink/15" aria-hidden="true" />
            <p className="px-2 pb-1 font-hand text-sm text-muted">collections (optional)</p>
            {actions.collections.length === 0 && (
              <p className="px-2 pb-1 text-xs text-muted">none yet — create one below</p>
            )}
            {actions.collections.map((c) => {
              const has = item.collectionIds?.includes(c.id) ?? false;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={menuBtn}
                  aria-pressed={has}
                  onClick={() => void actions.onToggleCollection(item.id, c.id)}
                >
                  <span className="grid h-4 w-4 place-items-center">
                    {has && <DoodleIcon icon={Check} size={13} strokeWidth={2.4} />}
                  </span>
                  {c.name}
                </button>
              );
            })}
            <div className="mt-1 flex items-center gap-1 border-t border-ink/15 px-2 pt-1.5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void createCollection();
                  }
                }}
                placeholder="new collection…"
                aria-label="New collection name"
                className="w-full bg-transparent font-hand text-base focus:outline-none placeholder:text-muted/60"
              />
              <button
                type="button"
                onClick={() => void createCollection()}
                aria-label="Create collection and add item"
                className="shrink-0 text-muted hover:text-ink"
              >
                <DoodleIcon icon={FolderPlus} size={16} />
              </button>
            </div>
            <div className="my-1 border-t border-ink/15" aria-hidden="true" />
            <button
              type="button"
              className={`${menuBtn} hover:text-error`}
              onClick={() => {
                setOpen(false);
                void actions.deleteItem(item.id);
              }}
            >
              <DoodleIcon icon={Trash2} size={15} /> delete
            </button>
            <span className="sr-only">
              <Plus />
            </span>
          </SketchBorder>
        </div>
      )}
    </div>
  );
}
