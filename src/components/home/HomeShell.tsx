"use client";

import { useEffect, useMemo, useState } from "react";
import { Folder, Settings } from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import FilterBar from "./FilterBar";
import ItemGrid from "./ItemGrid";
import EmptyState from "./EmptyState";
import SaveModal from "./SaveModal";
import SketchPlaceholder from "./SketchPlaceholder";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import CheckDoodle from "../sketch/CheckDoodle";
import UnderlineText from "../sketch/UnderlineText";
import { useItems } from "@/lib/items-context";
import { getDomain } from "@/lib/utils";
import type { Filter, ItemType, NewSavedItem, View } from "@/lib/types";

const SECTIONS: { type: ItemType; title: string; cols: string }[] = [
  { type: "link", title: "Links", cols: "lg:grid-cols-3" },
  { type: "note", title: "Notes", cols: "lg:grid-cols-2" },
  { type: "image", title: "Images", cols: "lg:grid-cols-3" },
];

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <SketchBorder className="mt-8 block bg-card px-6 py-10 text-center">
      <p className="font-hand text-2xl">
        nothing matches {query ? `“${query}”` : "that filter"}…
      </p>
      <p className="mt-1 text-sm text-muted">try a different word, or clear the search.</p>
      <SketchButton variant="ghost" size="sm" className="mt-4" onClick={onClear}>
        clear search
      </SketchButton>
    </SketchBorder>
  );
}

export default function HomeShell() {
  const { items, addItem, deleteItem } = useItems();
  const [view, setView] = useState<View>("home");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((it) => (filter === "all" ? true : it.type === filter))
      .filter((it) => {
        if (!q) return true;
        const hay = [it.title, it.url, it.description, it.content, it.url ? getDomain(it.url) : ""]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [items, filter, query]);

  const handleSave = (input: NewSavedItem) => {
    addItem(input);
    setModalOpen(false);
    setToast("saved to your nook");
  };

  const clearSearch = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar view={view} onChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header query={query} onQuery={setQuery} onSave={() => setModalOpen(true)} />

        <main className="flex-1 px-5 py-7 sm:px-8 sm:py-9 lg:px-20 lg:py-11">
          {view === "home" ? (
            <>
              <h1 className="group w-fit font-hand text-[32px] leading-tight">
                <UnderlineText>Hi there!</UnderlineText>
              </h1>
              {items.length === 0 ? (
                <EmptyState onSave={() => setModalOpen(true)} />
              ) : visible.length === 0 ? (
                <NoResults query={query} onClear={clearSearch} />
              ) : (
                SECTIONS.map((s) => {
                  const list = visible.filter((it) => it.type === s.type);
                  if (list.length === 0) return null;
                  return (
                    <section key={s.type} className="mt-10 first:mt-8">
                      <h2 className="mb-4 font-hand text-2xl">{s.title}</h2>
                      <ItemGrid items={list} onDelete={deleteItem} className={s.cols} />
                    </section>
                  );
                })
              )}
            </>
          ) : view === "all" ? (
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                <h1 className="font-hand text-[32px] leading-tight">Saved</h1>
                <FilterBar filter={filter} onChange={setFilter} items={items} />
              </div>
              {visible.length === 0 ? (
                <NoResults query={query} onClear={clearSearch} />
              ) : (
                <ItemGrid items={visible} onDelete={deleteItem} className="lg:grid-cols-3" />
              )}
            </>
          ) : view === "collections" ? (
            <SketchPlaceholder title="collections" icon={Folder}>
              still being sketched — named collections arrive with the next milestone.
            </SketchPlaceholder>
          ) : (
            <SketchPlaceholder title="settings" icon={Settings}>
              still being sketched — account &amp; app settings arrive with the next milestone.
            </SketchPlaceholder>
          )}
        </main>
      </div>

      {modalOpen && (
        <SaveModal open onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}

      {toast && (
        <div aria-live="polite" className="fixed bottom-6 left-1/2 z-50 animate-toast">
          <SketchBorder
            role="status"
            className="flex items-center gap-2 bg-card px-4 py-2"
          >
            <CheckDoodle className="h-5 w-5 text-ink" />
            <span className="font-hand text-lg">{toast}</span>
          </SketchBorder>
        </div>
      )}
    </div>
  );
}
