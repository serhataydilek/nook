"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Settings, X } from "lucide-react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Board from "./Board";
import Toolbar from "./Toolbar";
import FilterBar from "./FilterBar";
import EmptyState from "./EmptyState";
import SaveModal from "./SaveModal";
import DrawModal from "./DrawModal";
import CollectionsView from "./CollectionsView";
import SketchPlaceholder from "./SketchPlaceholder";
import SketchBorder from "../sketch/SketchBorder";
import SketchButton from "../sketch/SketchButton";
import SketchModal from "../sketch/SketchModal";
import CheckDoodle from "../sketch/CheckDoodle";
import UnderlineText from "../sketch/UnderlineText";
import DoodleIcon from "../sketch/DoodleIcon";
import { useNook } from "@/lib/store";
import { detectFromText, extractFromClipboard, type PasteAction } from "@/lib/detect";
import { fetchLinkMetadata } from "@/lib/metadata";
import { getDomain } from "@/lib/utils";
import { findFreeSpot, PAD } from "@/lib/layout";
import type { Filter, SavedItem, Stroke, View } from "@/lib/types";
import type { ItemActions } from "./actions";

const DEFAULT_W: Record<SavedItem["type"], number> = {
  link: 340,
  note: 340,
  image: 380,
  list: 320,
  drawing: 400,
};

const EST_H: Record<SavedItem["type"], number> = {
  link: 130,
  note: 170,
  image: 190,
  list: 170,
  drawing: 260,
};

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <SketchBorder className="mt-8 block px-6 py-10 text-center">
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

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !!target.closest("input, textarea, select, [contenteditable='true']")
  );
}

export default function HomeShell() {
  const store = useNook();
  const { items, collections } = store;

  const [view, setView] = useState<View>("home");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [drawState, setDrawState] = useState<{ open: boolean; item: SavedItem | null }>({
    open: false,
    item: null,
  });
  const [lightbox, setLightbox] = useState<SavedItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tidySignal, setTidySignal] = useState(0);
  const boardAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  /* ------------------------------- filtering ------------------------------ */

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((it) => (collectionId ? it.collectionIds?.includes(collectionId) : true))
      .filter((it) => (filter === "all" ? true : it.type === filter))
      .filter((it) => {
        if (!q) return true;
        const hay = [
          it.title,
          it.url,
          it.description,
          it.content,
          it.url ? getDomain(it.url) : "",
          ...(it.list ?? []).map((e) => e.text),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [items, collectionId, filter, query]);

  /* ---------------------------- paste-to-save ----------------------------- */

  const placeFor = useCallback(
    (type: SavedItem["type"], at: { x: number; y: number } | null): { x: number; y: number; w: number } => {
      const w = DEFAULT_W[type];
      if (at) {
        const boardW = boardAreaRef.current?.clientWidth ?? 1200;
        return { x: Math.min(Math.max(PAD, Math.round(at.x / 8) * 8), Math.max(PAD, boardW - w - PAD)), y: Math.max(PAD, Math.round(at.y / 8) * 8), w };
      }
      const boardW = boardAreaRef.current?.clientWidth ?? 1200;
      const spot = findFreeSpot(
        items.map((it) => ({ x: it.x, y: it.y, w: it.w, h: EST_H[it.type] })),
        w,
        EST_H[type],
        boardW,
      );
      return { ...spot, w };
    },
    [items],
  );

  const handleAction = useCallback(
    async (action: PasteAction, at: { x: number; y: number } | null) => {
      if (action.kind === "image") {
        const pos = placeFor("image", at);
        await store.addImageFile(action.file, pos);
        setToast("image saved to your desk");
        return;
      }
      if (action.kind === "link") {
        const pos = placeFor("link", at);
        const item = await store.addItem({
          type: "link",
          url: action.url,
          title: getDomain(action.url),
          ...pos,
        });
        setToast("link saved to your desk");
        // best-effort metadata; the domain title is already there as fallback
        void fetchLinkMetadata(action.url).then((meta) => {
          if (meta?.title || meta?.description) {
            void store.updateItem(item.id, {
              title: meta.title || getDomain(action.url),
              description: meta.description || undefined,
            });
          }
        });
        return;
      }
      const pos = placeFor("note", at);
      await store.addItem({ type: "note", content: action.text, ...pos });
      setToast("note saved to your desk");
    },
    [placeFor, store],
  );

  // global paste (Ctrl/Cmd+V) and drop anywhere on the workspace — never inside fields
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target)) return; // don't intercept paste inside text fields
      const cd = e.clipboardData;
      if (!cd) return;
      const action = extractFromClipboard({
        files: Array.from(cd.files),
        text: cd.getData("text/plain"),
        uriList: cd.getData("text/uri-list"),
      });
      if (!action) return;
      e.preventDefault();
      void handleAction(action, null);
    };
    const onDragOver = (e: DragEvent) => {
      if (isEditableTarget(e.target)) return;
      if (e.dataTransfer) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    };
    const onDrop = (e: DragEvent) => {
      if (isEditableTarget(e.target)) return;
      const dt = e.dataTransfer;
      if (!dt) return;
      const action = extractFromClipboard({
        files: Array.from(dt.files),
        text: dt.getData("text/plain"),
        uriList: dt.getData("text/uri-list"),
      });
      if (!action) return;
      e.preventDefault();
      let at: { x: number; y: number } | null = null;
      const board = boardAreaRef.current;
      if (board && view === "home") {
        const rect = board.getBoundingClientRect();
        at = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
      void handleAction(action, at);
    };
    document.addEventListener("paste", onPaste);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("drop", onDrop);
    return () => {
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("drop", onDrop);
    };
  }, [handleAction, view]);

  /* ------------------------------ item actions ----------------------------- */

  const actions: ItemActions = useMemo(
    () => ({
      updateItem: store.updateItem,
      deleteItem: store.deleteItem,
      imageUrl: store.imageUrl,
      onEditDrawing: (item) => setDrawState({ open: true, item }),
      onOpenImage: (item) => setLightbox(item),
      collections,
      onToggleCollection: store.toggleCollection,
      onCreateCollection: store.createCollection,
    }),
    [store, collections],
  );

  const handleSaveText = useCallback(
    (text: string) => {
      const action = detectFromText(text);
      setSaveOpen(false);
      if (action) void handleAction(action, null);
    },
    [handleAction],
  );

  const handleImageFiles = useCallback(
    (files: File[]) => {
      for (const f of files) {
        if (f.type.startsWith("image/")) void handleAction({ kind: "image", file: f }, null);
      }
    },
    [handleAction],
  );

  const handleNewList = useCallback(async () => {
    const pos = placeFor("list", null);
    await store.addItem({
      type: "list",
      title: "list",
      list: [],
      ...pos,
    });
    setToast("list added — start typing");
  }, [placeFor, store]);

  const handleDrawSave = useCallback(
    (strokes: Stroke[], w: number, h: number) => {
      if (drawState.item) {
        void store.updateItem(drawState.item.id, { strokes, drawW: w, drawH: h });
        setToast("drawing updated");
      } else {
        const pos = placeFor("drawing", null);
        void store.addItem({ type: "drawing", strokes, drawW: w, drawH: h, ...pos });
        setToast("drawing saved to your desk");
      }
    },
    [drawState.item, placeFor, store],
  );

  const clearSearch = () => {
    setQuery("");
    setFilter("all");
  };

  const activeCollection = collections.find((c) => c.id === collectionId) ?? null;

  /* --------------------------------- render -------------------------------- */

  if (!store.ready) {
    return (
      <div className="nook-frame flex items-center justify-center">
        <p className="font-hand text-2xl text-muted">opening your nook…</p>
      </div>
    );
  }

  return (
    <div className="nook-frame flex flex-col md:flex-row">
      <Sidebar view={view} onChange={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header query={query} onQuery={setQuery} onSave={() => setSaveOpen(true)} />

        <main className="nook-main flex-1">
          {view === "home" || view === "all" ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <h1 className="group w-fit font-hand text-[44px] leading-tight">
                  <UnderlineText>{view === "home" ? "Hi there!" : "Saved"}</UnderlineText>
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {activeCollection && (
                    <button
                      type="button"
                      onClick={() => setCollectionId(null)}
                      className="font-hand text-lg text-ink"
                      aria-label={`Clear collection filter ${activeCollection.name}`}
                    >
                      <span className="hatch">
                        {activeCollection.name} ✕
                      </span>
                    </button>
                  )}
                  <FilterBar filter={filter} onChange={setFilter} items={collectionId ? items.filter((it) => it.collectionIds?.includes(collectionId)) : items} />
                  {view === "home" && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTidySignal((n) => n + 1)}
                      className="font-hand text-lg text-muted transition-transform duration-150 hover:-rotate-1 hover:text-ink"
                    >
                      tidy up
                    </button>
                  )}
                </div>
              </div>

              {items.length === 0 ? (
                <EmptyState onSave={() => setSaveOpen(true)} />
              ) : visible.length === 0 ? (
                <NoResults query={query} onClear={clearSearch} />
              ) : (
                <div className="mt-8">
                  <Board
                    items={visible}
                    actions={actions}
                    layout={view === "home" ? "free" : "grid"}
                    boardAreaRef={boardAreaRef}
                    tidySignal={tidySignal}
                  />
                </div>
              )}
            </>
          ) : view === "collections" ? (
            <CollectionsView
              collections={collections}
              items={items}
              onCreate={store.createCollection}
              onDelete={store.deleteCollection}
              onOpen={(id) => {
                setCollectionId(id);
                setView("home");
              }}
            />
          ) : (
            <SketchPlaceholder title="settings" icon={Settings}>
              still being sketched — account &amp; app settings arrive with a later milestone.
            </SketchPlaceholder>
          )}
        </main>
      </div>

      <Toolbar
        onNote={() => setSaveOpen(true)}
        onList={() => void handleNewList()}
        onDraw={() => setDrawState({ open: true, item: null })}
        onImageFiles={handleImageFiles}
      />

      {saveOpen && (
        <SaveModal
          open
          onClose={() => setSaveOpen(false)}
          onSubmitText={handleSaveText}
          onImageFile={(f) => {
            setSaveOpen(false);
            void handleAction({ kind: "image", file: f }, null);
          }}
        />
      )}

      {drawState.open && (
        <DrawModal
          open
          onClose={() => setDrawState({ open: false, item: null })}
          initial={drawState.item}
          onSave={handleDrawSave}
        />
      )}

      {lightbox && (
        <SketchModal
          open
          onClose={() => setLightbox(null)}
          title={lightbox.title || "image"}
        >
          {store.imageUrl(lightbox) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.imageUrl(lightbox) ?? ""}
              alt={lightbox.title || "saved image"}
              className="max-h-[70dvh] w-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="mt-3 inline-flex items-center gap-1 font-hand text-base text-muted hover:text-ink"
          >
            <DoodleIcon icon={X} size={15} /> close
          </button>
        </SketchModal>
      )}

      {toast && (
        <div aria-live="polite" className="fixed bottom-6 left-1/2 z-50 animate-toast">
          <SketchBorder
            role="status"
            seedKey="toast"
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
