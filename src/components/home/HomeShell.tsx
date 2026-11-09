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
import { useItems } from "@/lib/items-context";
import { getDomain } from "@/lib/utils";
import type { Filter, NewSavedItem, View } from "@/lib/types";

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <SketchBorder className="sketch-radius mt-4 block bg-card px-6 py-10 text-center">
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

  const showGrid = view === "home" || view === "all";

  return (
    <div className="flex min-h-dvh flex-col">
      <Header query={query} onQuery={setQuery} onSave={() => setModalOpen(true)} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-2 px-4 pt-6 sm:gap-6 sm:px-6">
        <Sidebar view={view} onChange={setView} />

        <main className="min-w-0 flex-1 pb-16">
          {showGrid ? (
            <>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                <h1 className="font-hand text-3xl">{view === "home" ? "your nook" : "all saved"}</h1>
                <FilterBar filter={filter} onChange={setFilter} items={items} />
              </div>
              {items.length === 0 ? (
                <EmptyState onSave={() => setModalOpen(true)} />
              ) : visible.length === 0 ? (
                <NoResults
                  query={query}
                  onClear={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                />
              ) : (
                <ItemGrid items={visible} onDelete={deleteItem} />
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

      <footer className="mt-auto px-4 pb-4 text-center font-hand text-sm text-muted">
        nook — your little corner of the internet
      </footer>

      {modalOpen && (
        <SaveModal open onClose={() => setModalOpen(false)} onSave={handleSave} />
      )}

      {toast && (
        <div aria-live="polite" className="fixed bottom-6 left-1/2 z-50 animate-toast">
          <SketchBorder
            role="status"
            className="sketch-radius sketch-shadow flex items-center gap-2 bg-card px-4 py-2"
          >
            <CheckDoodle className="h-5 w-5 text-ink" />
            <span className="font-hand text-lg">{toast}</span>
          </SketchBorder>
        </div>
      )}
    </div>
  );
}
