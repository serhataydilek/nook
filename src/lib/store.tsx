"use client";

/**
 * Nook's data layer. Items, collections, and image blobs live in IndexedDB
 * (see storage/db.ts), so everything survives a refresh. The interface is
 * deliberately store-agnostic: a later milestone can back it with Supabase
 * (auth + Postgres + Storage) without changing the UI.
 *
 * In development only, an empty database is seeded with representative
 * content so the workspace can be evaluated. Production always starts from
 * the real (possibly empty) state.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { idbDel, idbGet, idbGetAll, idbPut } from "./storage/db";
import type { Collection, NewSavedItem, SavedItem } from "./types";

/* ------------------------------------------------------------------ */
/* Development-only preview seed                                       */
/* ------------------------------------------------------------------ */

function seedImage(inner: string): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 125"><rect width="300" height="125" fill="#FCF7F1"/>${inner}</svg>`,
  )}`;
}

const INK = "stroke='#1B1B1B' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'";

function wavyLine(y: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let x = 30; x <= 450; x += 15) {
    pts.push({ x, y: y + Math.sin(x / 28) * 14 });
  }
  return pts;
}

function roughCircle(cx: number, cy: number, r: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let a = 0; a <= Math.PI * 2 + 0.3; a += 0.35) {
    const rr = r + Math.sin(a * 3) * 2.5;
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr * 0.8 });
  }
  return pts;
}

const DEV_SEED_ITEMS: (Omit<SavedItem, "id" | "createdAt" | "updatedAt" | "blobId"> & {
  id: string;
  seedImage?: string;
})[] = [
  {
    id: "seed-link-1",
    type: "link",
    title: "Cool article",
    url: "https://example.com/cool-article",
    description: "On sketching interfaces with a fineliner pen.",
    x: 8, y: 8, w: 340,
  },
  {
    id: "seed-link-2",
    type: "link",
    title: "Design inspo",
    url: "https://inspo.design",
    description: "Hand-drawn UI references and moodboards.",
    x: 372, y: 8, w: 340,
  },
  {
    id: "seed-link-3",
    type: "link",
    title: "Useful tools",
    url: "https://tools.example.com",
    description: "Little utilities I reach for every day.",
    x: 736, y: 8, w: 340,
  },
  {
    id: "seed-note-1",
    type: "note",
    title: "Ideas:",
    content: "• new collection\n• organize links\n• weekend project?",
    x: 8, y: 170, w: 360,
  },
  {
    id: "seed-note-2",
    type: "note",
    title: "Remember:",
    content: "[ ] review saves\n[ ] clean up notes\n[ ] plan next week",
    x: 392, y: 170, w: 360,
  },
  {
    id: "seed-img-1",
    type: "image",
    seedImage: seedImage(
      `<path d="M25 105 L95 30 L125 68 L155 42 L240 105" ${INK}/><circle cx="225" cy="30" r="14" ${INK}/>`,
    ),
    x: 8, y: 400, w: 380,
  },
  {
    id: "seed-img-2",
    type: "image",
    seedImage: seedImage(
      `<path d="M15 75 C 55 45, 85 95, 125 70 S 195 45, 235 80 S 275 92, 290 82" ${INK}/><path d="M15 100 C 65 75, 105 112, 155 90 S 235 72, 290 98" ${INK}/>`,
    ),
    x: 412, y: 400, w: 380,
  },
  {
    id: "seed-list-1",
    type: "list",
    title: "groceries",
    list: [
      { id: "l1", text: "coffee beans", checked: true },
      { id: "l2", text: "good bread", checked: false },
      { id: "l3", text: "lemons", checked: false },
    ],
    x: 8, y: 640, w: 320,
  },
  {
    id: "seed-drawing-1",
    type: "drawing",
    title: "sunny day",
    drawW: 480,
    drawH: 300,
    strokes: [
      { tool: "pen", width: 4, color: "#1B1B1B", points: wavyLine(210) },
      { tool: "pen", width: 4, color: "#1B1B1B", points: roughCircle(360, 80, 38) },
      { tool: "pen", width: 4, color: "#1B1B1B", points: [
        { x: 60, y: 240 }, { x: 120, y: 140 }, { x: 180, y: 240 },
      ] },
    ],
    x: 352, y: 640, w: 400,
  },
];

/* ------------------------------------------------------------------ */

interface NookStoreValue {
  ready: boolean;
  items: SavedItem[];
  collections: Collection[];
  /** synchronous object-URL lookup for image items (preloaded on init) */
  imageUrl: (item: SavedItem) => string | null;
  addItem: (input: NewSavedItem) => Promise<SavedItem>;
  updateItem: (id: string, patch: Partial<SavedItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  /** store an image file as a blob and create an image item */
  addImageFile: (file: File, pos: { x: number; y: number; w: number }) => Promise<SavedItem>;
  createCollection: (name: string) => Promise<Collection>;
  deleteCollection: (id: string) => Promise<void>;
  toggleCollection: (itemId: string, collectionId: string) => Promise<void>;
}

const NookStore = createContext<NookStoreValue | null>(null);

export function NookProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const urlsRef = useRef(urls);
  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  // Load everything from IndexedDB on mount; seed in development if empty.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedItems, storedCollections] = await Promise.all([
        idbGetAll<SavedItem>("items"),
        idbGetAll<Collection>("collections"),
      ]);
      let finalItems = storedItems;
      if (process.env.NODE_ENV === "development" && storedItems.length === 0) {
        const now = 1762600000000;
        const seeded: SavedItem[] = [];
        for (const [i, s] of DEV_SEED_ITEMS.entries()) {
          const { seedImage, ...rest } = s;
          const item: SavedItem = {
            ...rest,
            createdAt: now - (DEV_SEED_ITEMS.length - i) * 1000,
            updatedAt: now,
          };
          if (seedImage) {
            const blob = await (await fetch(seedImage)).blob();
            const blobId = `seed-blob-${s.id}`;
            await idbPut("blobs", { id: blobId, blob });
            item.blobId = blobId;
          }
          await idbPut("items", item);
          seeded.push(item);
        }
        finalItems = seeded;
      }
      if (cancelled) return;
      // Preload object URLs for all image blobs.
      const urlMap = new Map<string, string>();
      for (const it of finalItems) {
        if (it.blobId) {
          const rec = await idbGet<{ id: string; blob: Blob }>("blobs", it.blobId);
          if (rec) urlMap.set(it.blobId, URL.createObjectURL(rec.blob));
        }
      }
      if (cancelled) return;
      setUrls(urlMap);
      setItems(finalItems);
      setCollections(storedCollections);
      setReady(true);
    })().catch((err) => {
      console.error("failed to load nook from IndexedDB", err);
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Revoke object URLs on unmount.
  useEffect(() => {
    const map = urlsRef.current;
    return () => {
      for (const u of map.values()) URL.revokeObjectURL(u);
    };
  }, []);

  const imageUrl = useCallback(
    (item: SavedItem): string | null => (item.blobId ? (urlsRef.current.get(item.blobId) ?? null) : null),
    [],
  );

  const addItem = useCallback(async (input: NewSavedItem): Promise<SavedItem> => {
    const now = Date.now();
    const item: SavedItem = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    await idbPut("items", item);
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const updateItem = useCallback(async (id: string, patch: Partial<SavedItem>) => {
    setItems((prev) => {
      const next = prev.map((it) =>
        it.id === id ? { ...it, ...patch, updatedAt: Date.now() } : it,
      );
      const updated = next.find((it) => it.id === id);
      if (updated) void idbPut("items", updated);
      return next;
    });
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.blobId) {
        void idbDel("blobs", target.blobId);
        const u = urlsRef.current.get(target.blobId);
        if (u) {
          URL.revokeObjectURL(u);
          const copy = new Map(urlsRef.current);
          copy.delete(target.blobId);
          setUrls(copy);
        }
      }
      return prev.filter((it) => it.id !== id);
    });
    await idbDel("items", id);
  }, []);

  const addImageFile = useCallback(
    async (file: File, pos: { x: number; y: number; w: number }): Promise<SavedItem> => {
      const blobId = crypto.randomUUID();
      await idbPut("blobs", { id: blobId, blob: file });
      const url = URL.createObjectURL(file);
      setUrls((prev) => new Map(prev).set(blobId, url));
      return addItem({
        type: "image",
        title: file.name.replace(/\.[^.]+$/, ""),
        blobId,
        x: pos.x,
        y: pos.y,
        w: pos.w,
      });
    },
    [addItem],
  );

  const createCollection = useCallback(async (name: string): Promise<Collection> => {
    const c: Collection = { id: crypto.randomUUID(), name: name.trim(), createdAt: Date.now() };
    await idbPut("collections", c);
    setCollections((prev) => [...prev, c]);
    return c;
  }, []);

  const deleteCollection = useCallback(async (id: string) => {
    await idbDel("collections", id);
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setItems((prev) => {
      const next = prev.map((it) =>
        it.collectionIds?.includes(id)
          ? { ...it, collectionIds: it.collectionIds.filter((c) => c !== id), updatedAt: Date.now() }
          : it,
      );
      for (const it of next) {
        const orig = prev.find((p) => p.id === it.id);
        if (orig && orig.collectionIds !== it.collectionIds) void idbPut("items", it);
      }
      return next;
    });
  }, []);

  const toggleCollection = useCallback(async (itemId: string, collectionId: string) => {
    setItems((prev) => {
      const next = prev.map((it) => {
        if (it.id !== itemId) return it;
        const has = it.collectionIds?.includes(collectionId) ?? false;
        const collectionIds = has
          ? it.collectionIds?.filter((c) => c !== collectionId)
          : [...(it.collectionIds ?? []), collectionId];
        const updated = { ...it, collectionIds, updatedAt: Date.now() };
        void idbPut("items", updated);
        return updated;
      });
      return next;
    });
  }, []);

  const value = useMemo<NookStoreValue>(
    () => ({
      ready,
      items,
      collections,
      imageUrl,
      addItem,
      updateItem,
      deleteItem,
      addImageFile,
      createCollection,
      deleteCollection,
      toggleCollection,
    }),
    [ready, items, collections, imageUrl, addItem, updateItem, deleteItem, addImageFile, createCollection, deleteCollection, toggleCollection],
  );

  return <NookStore.Provider value={value}>{children}</NookStore.Provider>;
}

export function useNook(): NookStoreValue {
  const ctx = useContext(NookStore);
  if (!ctx) throw new Error("useNook must be used within <NookProvider>");
  return ctx;
}
