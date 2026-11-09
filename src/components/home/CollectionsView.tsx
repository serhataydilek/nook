"use client";

import { useState, type FormEvent } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";
import type { Collection, SavedItem } from "@/lib/types";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import DoodleIcon from "../sketch/DoodleIcon";

export interface CollectionsViewProps {
  collections: Collection[];
  items: SavedItem[];
  onCreate: (name: string) => Promise<Collection>;
  onDelete: (id: string) => Promise<void>;
  onOpen: (id: string) => void;
}

export default function CollectionsView({
  collections,
  items,
  onCreate,
  onDelete,
  onOpen,
}: CollectionsViewProps) {
  const [name, setName] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    void onCreate(name);
    setName("");
  };

  const countFor = (id: string) => items.filter((it) => it.collectionIds?.includes(id)).length;

  return (
    <div>
      <h1 className="font-hand text-[44px] leading-tight">collections</h1>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
        completely optional — save first, organize later. a collection is just a name you can
        attach to things on your desk.
      </p>

      <form onSubmit={submit} className="mt-6 flex max-w-md items-center gap-2">
        <SketchBorder className="sketch-box block flex-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="new collection name…"
            aria-label="New collection name"
            className="w-full bg-transparent px-3 py-2 font-hand text-lg focus:outline-none placeholder:text-muted/60"
          />
        </SketchBorder>
        <SketchButton type="submit" size="sm" disabled={!name.trim()}>
          <DoodleIcon icon={Plus} size={16} strokeWidth={2} />
          add
        </SketchButton>
      </form>

      {collections.length === 0 ? (
        <SketchBorder className="mt-8 block bg-card px-6 py-10 text-center">
          <DoodleIcon icon={Folder} size={26} className="mx-auto text-muted" />
          <p className="mt-2 font-hand text-xl">no collections yet</p>
          <p className="mt-1 text-sm text-muted">they will show up here when you make one.</p>
        </SketchBorder>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <li key={c.id}>
              <SketchBorder
                seedKey={c.id}
                radius={0.5}
                className="group block bg-card p-4 transition-transform duration-150 hover:-rotate-[0.5deg]"
              >
                <div className="flex items-start gap-3">
                  <DoodleIcon icon={Folder} size={20} className="mt-1 shrink-0" />
                  <button
                    type="button"
                    onClick={() => onOpen(c.id)}
                    className="min-w-0 flex-1 text-left"
                    aria-label={`Open collection ${c.name}`}
                  >
                    <h2 className="truncate font-hand text-xl leading-snug">{c.name}</h2>
                    <p className="mt-0.5 text-xs text-muted">
                      {countFor(c.id)} {countFor(c.id) === 1 ? "thing" : "things"}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(c.id)}
                    aria-label={`Delete collection ${c.name}`}
                    className="text-muted opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <DoodleIcon icon={Trash2} size={15} strokeWidth={1.8} />
                  </button>
                </div>
              </SketchBorder>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
